import { supabase, isSupabaseConfigured } from './supabase';
import {
  UserProfile,
  Session,
  Challenge,
  ChallengeTask,
  Artwork,
  Insight,
  Achievement
} from '../types';
import { getArtworkImageBlob } from './image-store';
import {
  loadStoredUserProfile,
  loadStoredSessions,
  loadStoredChallenges,
  loadStoredArtworks,
  loadStoredInsights,
  loadStoredAchievements
} from './local-store';

/**
 * Custom Error wrapper for Supabase service operations
 */
export class SupabaseServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseServiceError';
  }
}

/**
 * Checks if a Supabase PostgREST error is due to a table not yet being created or cached
 */
export function isTableMissingError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    (typeof error.message === 'string' && (
      error.message.includes('schema cache') ||
      (error.message.includes('relation') && error.message.includes('does not exist'))
    ))
  );
}

// ============================================================================
// 1. USER PROFILE SERVICE
// ============================================================================

export async function getRemoteUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    // 1. Try querying by user_id
    let res = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // 2. If user_id column query fails or has error, try id column
    if (res.error || !res.data) {
      const idRes = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!idRes.error && idRes.data) {
        res = idRes;
      }
    }

    if (res.error) {
      console.warn('Error fetching Supabase user profile:', res.error);
      return null;
    }

    const data = res.data;
    if (!data) return null;

    return {
      id: data.user_id || data.id || userId,
      name: data.name || 'Artist',
      drawingExperience: data.drawing_experience || data.drawingExperience || '3–5 years',
      customExperience: data.custom_drawing_experience || data.custom_experience || data.customExperience || undefined,
      goals: Array.isArray(data.goals) ? data.goals : [],
      customGoals: Array.isArray(data.custom_goals) ? data.custom_goals : (Array.isArray(data.customGoals) ? data.customGoals : []),
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now()
    };
  } catch (err) {
    console.warn('Unexpected error getting user profile:', err);
    return null;
  }
}

export async function upsertRemoteUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const experience = profile.drawingExperience || '3–5 years';
  const customExp = profile.customExperience?.trim() || null;
  const name = profile.name?.trim() || 'Artist';
  const goals = profile.goals || [];
  const customGoals = profile.customGoals || [];
  const updatedAt = new Date().toISOString();

  // Attempt payloads to handle any schema column configuration (user_id/id, custom_drawing_experience/custom_experience)
  const attemptPayloads: Array<Record<string, any>> = [
    // 1. Standard prompt schema with user_id & custom_drawing_experience
    {
      user_id: userId,
      name,
      drawing_experience: experience,
      custom_drawing_experience: customExp,
      goals,
      custom_goals: customGoals,
      updated_at: updatedAt
    },
    // 2. Schema with both user_id & id, plus both custom column names
    {
      user_id: userId,
      id: userId,
      name,
      drawing_experience: experience,
      custom_drawing_experience: customExp,
      custom_experience: customExp,
      goals,
      custom_goals: customGoals,
      updated_at: updatedAt
    },
    // 3. Schema with id and custom_drawing_experience
    {
      id: userId,
      name,
      drawing_experience: experience,
      custom_drawing_experience: customExp,
      goals,
      custom_goals: customGoals,
      updated_at: updatedAt
    },
    // 4. Schema with id and custom_experience
    {
      id: userId,
      name,
      drawing_experience: experience,
      custom_experience: customExp,
      goals,
      custom_goals: customGoals,
      updated_at: updatedAt
    },
    // 5. Schema with user_id and custom_experience
    {
      user_id: userId,
      name,
      drawing_experience: experience,
      custom_experience: customExp,
      goals,
      custom_goals: customGoals,
      updated_at: updatedAt
    },
    // 6. Minimal core schema
    {
      user_id: userId,
      name,
      drawing_experience: experience,
      goals,
      updated_at: updatedAt
    },
    // 7. Minimal core with id
    {
      id: userId,
      name,
      drawing_experience: experience,
      goals,
      updated_at: updatedAt
    }
  ];

  let lastError: any = null;

  for (const payload of attemptPayloads) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.user_id || data.id || userId,
          name: data.name || name,
          drawingExperience: data.drawing_experience || experience,
          customExperience: data.custom_drawing_experience || data.custom_experience || (customExp || undefined),
          goals: Array.isArray(data.goals) ? data.goals : goals,
          customGoals: Array.isArray(data.custom_goals) ? data.custom_goals : customGoals,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now()
        };
      }

      if (error) {
        lastError = error;
        // If table doesn't exist (PGRST205 / 42P01), no need to retry with different column combinations
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache')) {
          break;
        }
      }
    } catch (e) {
      lastError = e;
    }
  }

  if (lastError) {
    console.warn('Supabase profile upsert warning:', lastError?.message || lastError);
    // If the table hasn't been created in Supabase yet (PGRST205 / table missing)
    if (lastError.code === 'PGRST205' || lastError.code === '42P01' || lastError.message?.includes('schema cache')) {
      throw new SupabaseServiceError(
        'The "profiles" table is not created in your Supabase project yet. Please run the SQL schema script in the Supabase SQL Editor.',
        lastError
      );
    }
    throw new SupabaseServiceError(lastError.message || 'Failed to save profile to database', lastError);
  }

  return null;
}

// ============================================================================
// 2. SESSIONS SERVICE
// ============================================================================

export async function getRemoteSessions(userId: string): Promise<Session[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase sessions table not found in schema cache. Using local data.');
      } else {
        console.warn('Error fetching Supabase sessions:', error.message || error);
      }
      return [];
    }

    return (data || []).map((row: any): Session => ({
      id: row.id,
      title: row.title || undefined,
      topics: row.topics || [],
      goal: row.goal || undefined,
      sessionType: row.session_type === 'timed' ? 'timed' : 'free',
      timeLimit: row.time_limit ? Number(row.time_limit) : undefined,
      expiresAt: row.expires_at ? Number(row.expires_at) : undefined,
      status: row.status,
      startedAt: Number(row.started_at),
      pausedAt: row.paused_at ? Number(row.paused_at) : undefined,
      totalPausedDuration: Number(row.total_paused_duration || 0),
      completedAt: row.completed_at ? Number(row.completed_at) : undefined,
      duration: Number(row.duration || 0),
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
    }));
  } catch (err) {
    console.warn('Unexpected error in getRemoteSessions:', err);
    return [];
  }
}

export async function upsertRemoteSession(userId: string, session: Session): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const payloadWithTimedFields = {
      id: session.id,
      user_id: userId,
      title: session.title || null,
      topics: session.topics || [],
      goal: session.goal || null,
      session_type: session.sessionType || 'free',
      time_limit: session.timeLimit || null,
      expires_at: session.expiresAt || null,
      status: session.status,
      started_at: session.startedAt,
      paused_at: session.pausedAt || null,
      total_paused_duration: session.totalPausedDuration || 0,
      completed_at: session.completedAt || null,
      duration: session.duration || 0,
      updated_at: new Date().toISOString()
    };

    let { error } = await supabase.from('sessions').upsert(payloadWithTimedFields);

    // If remote table doesn't have the new timed columns yet, fallback gracefully to core columns
    if (error && (error.message?.includes('column') || error.code === '42703')) {
      const fallbackPayload = {
        id: session.id,
        user_id: userId,
        title: session.title || null,
        topics: session.topics || [],
        goal: session.goal || null,
        status: session.status,
        started_at: session.startedAt,
        paused_at: session.pausedAt || null,
        total_paused_duration: session.totalPausedDuration || 0,
        completed_at: session.completedAt || null,
        duration: session.duration || 0,
        updated_at: new Date().toISOString()
      };
      const retryResult = await supabase.from('sessions').upsert(fallbackPayload);
      error = retryResult.error;
    }

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase sessions table not found in schema cache. Session saved locally.');
      } else {
        console.warn('Warning upserting session to Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception upserting session:', err);
  }
}

export async function deleteRemoteSession(userId: string, sessionId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .match({ id: sessionId, user_id: userId });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase sessions table not found. Deleted locally.');
      } else {
        console.warn('Warning deleting session in Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception deleting session:', err);
  }
}

// ============================================================================
// 3. CHALLENGES & TASKS SERVICE
// ============================================================================

export async function getRemoteChallenges(userId: string): Promise<Challenge[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase challenges table not found in schema cache. Using local data.');
      } else {
        console.warn('Error fetching Supabase challenges:', error.message || error);
      }
      return [];
    }

    return (data || []).map((row: any): Challenge => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      startDate: row.start_date,
      endDate: row.end_date || undefined,
      duration: row.duration || '30 days',
      status: row.status,
      accent: row.accent || '#f59e0b',
      dailyGoal: row.daily_goal || undefined,
      completedAt: row.completed_at ? Number(row.completed_at) : undefined,
      tasks: Array.isArray(row.tasks) ? row.tasks : [],
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
    }));
  } catch (err) {
    console.warn('Unexpected error in getRemoteChallenges:', err);
    return [];
  }
}

export async function upsertRemoteChallenge(userId: string, challenge: Challenge): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase.from('challenges').upsert({
      id: challenge.id,
      user_id: userId,
      title: challenge.title,
      description: challenge.description || null,
      start_date: challenge.startDate,
      end_date: challenge.endDate || null,
      duration: challenge.duration,
      status: challenge.status,
      accent: challenge.accent,
      daily_goal: challenge.dailyGoal || null,
      completed_at: challenge.completedAt || null,
      tasks: challenge.tasks || [],
      updated_at: new Date().toISOString()
    });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase challenges table not found in schema cache. Challenge saved locally.');
      } else {
        console.warn('Warning upserting challenge to Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception upserting challenge:', err);
  }
}

export async function deleteRemoteChallenge(userId: string, challengeId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .match({ id: challengeId, user_id: userId });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase challenges table not found. Deleted locally.');
      } else {
        console.warn('Warning deleting challenge in Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception deleting challenge:', err);
  }
}

// ============================================================================
// 4. ARTWORKS & STORAGE SERVICE
// ============================================================================

/**
 * Generate a temporary signed URL for a private artwork image in Supabase Storage.
 * @param storagePath Storage path e.g. "{userId}/{filename}"
 * @param expiresInSeconds Duration in seconds (default: 7 days)
 */
export async function getArtworkSignedUrl(
  storagePath: string,
  expiresInSeconds: number = 60 * 60 * 24 * 7
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase || !storagePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from('artworks')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      console.warn('Error creating signed URL for artwork storage path:', storagePath, error.message);
      return null;
    }

    return data?.signedUrl || null;
  } catch (err) {
    console.warn('Exception generating signed URL for artwork:', err);
    return null;
  }
}

/**
 * Upload an artwork image to the private 'artworks' bucket organized under {userId}/{filename}.
 * Generates and returns a signed URL for private access.
 */
export async function uploadArtworkToStorage(
  userId: string,
  artworkId: string,
  imageSource: Blob | File | string
): Promise<{ signedUrl: string; publicUrl: string; storagePath: string } | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    let fileBlob: Blob;
    let contentType = 'image/png';

    if (imageSource instanceof File) {
      fileBlob = imageSource;
      contentType = imageSource.type || 'image/png';
    } else if (imageSource instanceof Blob) {
      fileBlob = imageSource;
      contentType = imageSource.type || 'image/png';
    } else if (typeof imageSource === 'string') {
      if (imageSource.startsWith('data:') || imageSource.startsWith('blob:')) {
        const res = await fetch(imageSource);
        fileBlob = await res.blob();
        contentType = fileBlob.type || 'image/png';
      } else {
        // External URL, return directly
        return { signedUrl: imageSource, publicUrl: imageSource, storagePath: '' };
      }
    } else {
      return null;
    }

    const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';
    const storagePath = `${userId}/${artworkId}-${Date.now()}.${ext}`;

    // Upload to user's folder in private bucket
    const { error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(storagePath, fileBlob, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.warn('Storage upload error (will fallback to local storage):', uploadError);
      return null;
    }

    // Generate signed URL (7-day validity) for private bucket access
    const { data: signedData, error: signError } = await supabase.storage
      .from('artworks')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    const signedUrl = signedData?.signedUrl || '';
    if (signError) {
      console.warn('Warning creating signed URL after upload:', signError);
    }

    return {
      signedUrl,
      publicUrl: signedUrl, // fallback property for compatibility
      storagePath
    };
  } catch (err) {
    console.warn('Unexpected error uploading artwork image to Supabase Storage:', err);
    return null;
  }
}

export async function deleteArtworkFromStorage(storagePath: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase || !storagePath) return;

  try {
    await supabase.storage.from('artworks').remove([storagePath]);
  } catch (err) {
    console.warn('Error removing artwork from Supabase Storage:', err);
  }
}

export async function getRemoteArtworks(userId: string): Promise<Artwork[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase artworks table not found in schema cache. Using local data.');
      } else {
        console.warn('Error fetching Supabase artworks:', error.message || error);
      }
      return [];
    }

    // Process artworks and generate fresh signed URLs for private storage files
    const artworksWithSignedUrls = await Promise.all(
      (data || []).map(async (row: any): Promise<Artwork> => {
        let imageId = row.image_url || row.image_id || '';
        const storagePath = row.storage_path;

        // If stored in private Supabase Storage, generate a signed URL
        if (storagePath && supabase) {
          try {
            const { data: signedData } = await supabase.storage
              .from('artworks')
              .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

            if (signedData?.signedUrl) {
              imageId = signedData.signedUrl;
            }
          } catch (signErr) {
            console.warn(`Could not generate signed URL for ${storagePath}:`, signErr);
          }
        }

        return {
          id: row.id,
          title: row.title,
          description: row.description || undefined,
          imageId,
          storagePath: row.storage_path || undefined,
          topics: row.topics || [],
          durationMs: Number(row.duration_ms || 0),
          date: row.date,
          mood: row.mood || undefined,
          notes: row.notes || undefined,
          sourceSessionId: row.source_session_id || undefined,
          createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
        };
      })
    );

    return artworksWithSignedUrls;
  } catch (err) {
    console.warn('Unexpected error in getRemoteArtworks:', err);
    return [];
  }
}

export async function upsertRemoteArtwork(
  userId: string,
  artwork: Artwork,
  storagePath?: string
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const effectiveStoragePath = storagePath || artwork.storagePath || null;
    const { error } = await supabase.from('artworks').upsert({
      id: artwork.id,
      user_id: userId,
      title: artwork.title,
      description: artwork.description || null,
      image_url: artwork.imageId,
      image_id: artwork.id,
      storage_path: effectiveStoragePath,
      topics: artwork.topics || [],
      duration_ms: artwork.durationMs || 0,
      date: artwork.date,
      mood: artwork.mood || null,
      notes: artwork.notes || null,
      source_session_id: artwork.sourceSessionId || null,
      updated_at: new Date().toISOString()
    });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase artworks table not found in schema cache. Artwork saved locally.');
      } else {
        console.warn('Warning upserting artwork to Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception upserting artwork:', err);
  }
}

export async function deleteRemoteArtwork(userId: string, artworkId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .match({ id: artworkId, user_id: userId });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase artworks table not found. Deleted locally.');
      } else {
        console.warn('Warning deleting artwork in Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception deleting artwork:', err);
  }
}

// ============================================================================
// 5. INSIGHTS SERVICE
// ============================================================================

export async function getRemoteInsights(userId: string): Promise<Insight[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase insights table not found in schema cache. Using local data.');
      } else {
        console.warn('Error fetching Supabase insights:', error.message || error);
      }
      return [];
    }

    return (data || []).map((row: any): Insight => ({
      id: row.id,
      title: row.title,
      content: row.content || '',
      tags: row.tags || [],
      relatedArtworkId: row.related_artwork_id || undefined,
      relatedChallengeId: row.related_challenge_id || undefined,
      relatedSessionId: row.related_session_id || undefined,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now()
    }));
  } catch (err) {
    console.warn('Unexpected error in getRemoteInsights:', err);
    return [];
  }
}

export async function upsertRemoteInsight(userId: string, insight: Insight): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase.from('insights').upsert({
      id: insight.id,
      user_id: userId,
      title: insight.title,
      content: insight.content,
      tags: insight.tags || [],
      related_artwork_id: insight.relatedArtworkId || null,
      related_challenge_id: insight.relatedChallengeId || null,
      related_session_id: insight.relatedSessionId || null,
      updated_at: new Date().toISOString()
    });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase insights table not found in schema cache. Insight saved locally.');
      } else {
        console.warn('Warning upserting insight to Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception upserting insight:', err);
  }
}

export async function deleteRemoteInsight(userId: string, insightId: string): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const { error } = await supabase
      .from('insights')
      .delete()
      .match({ id: insightId, user_id: userId });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase insights table not found. Deleted locally.');
      } else {
        console.warn('Warning deleting insight in Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception deleting insight:', err);
  }
}

// ============================================================================
// 6. ACHIEVEMENTS SERVICE
// ============================================================================

export async function getRemoteAchievements(
  userId: string,
  baseAchievements: Achievement[]
): Promise<Achievement[]> {
  if (!isSupabaseConfigured() || !supabase) return baseAchievements;

  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase user_achievements table not found in schema cache. Using local data.');
      } else {
        console.warn('Error fetching Supabase user_achievements:', error.message || error);
      }
      return baseAchievements;
    }

    const progressMap = new Map((data || []).map((row: any) => [row.id, row]));

    return baseAchievements.map(ach => {
      const remote = progressMap.get(ach.id);
      if (remote) {
        return {
          ...ach,
          unlocked: Boolean(remote.unlocked),
          unlockedAt: remote.unlocked_at ? Number(remote.unlocked_at) : undefined,
          currentValue: Number(remote.current_value || 0)
        };
      }
      return ach;
    });
  } catch (err) {
    console.warn('Unexpected error in getRemoteAchievements:', err);
    return baseAchievements;
  }
}

export async function upsertRemoteAchievements(
  userId: string,
  achievements: Achievement[]
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const payload = achievements.map(ach => ({
      id: ach.id,
      user_id: userId,
      unlocked: ach.unlocked,
      unlocked_at: ach.unlockedAt || null,
      current_value: ach.currentValue || 0,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('user_achievements')
      .upsert(payload, { onConflict: 'id,user_id' });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn('Supabase user_achievements table not found in schema cache. Achievements saved locally.');
      } else {
        console.warn('Warning upserting achievements to Supabase:', error.message || error);
      }
    }
  } catch (err) {
    console.warn('Exception upserting achievements:', err);
  }
}

// ============================================================================
// 7. ONE-TIME LOCALSTORAGE DATA MIGRATION SERVICE
// ============================================================================

export interface MigrationStatus {
  hasLocalData: boolean;
  localSessionCount: number;
  localArtworkCount: number;
  localChallengeCount: number;
  localInsightCount: number;
  localProfileName?: string;
}

/**
 * Check if there is meaningful existing data in localStorage
 */
export function checkLocalDataToMigrate(): MigrationStatus {
  const profile = loadStoredUserProfile();
  const sessions = loadStoredSessions();
  const artworks = loadStoredArtworks();
  const challenges = loadStoredChallenges();
  const insights = loadStoredInsights();

  // Filter out default starter templates if user hasn't modified them
  const hasUserSessions = sessions.length > 0;
  const hasUserArtworks = artworks.length > 0;
  const hasUserInsights = insights.length > 0;
  const hasUserChallenges = challenges.some(c => c.tasks.some(t => t.completed));
  const hasUserProfile = Boolean(profile && profile.name);

  const hasLocalData = hasUserSessions || hasUserArtworks || hasUserInsights || hasUserChallenges || hasUserProfile;

  return {
    hasLocalData,
    localSessionCount: sessions.length,
    localArtworkCount: artworks.length,
    localChallengeCount: challenges.length,
    localInsightCount: insights.length,
    localProfileName: profile?.name
  };
}

/**
 * Safely migrate all local records to Supabase PostgreSQL & Storage
 */
export async function migrateLocalDataToSupabase(
  userId: string,
  onProgress?: (step: string, percentage: number) => void
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    onProgress?.('Migrating Studio Profile...', 10);
    const localProfile = loadStoredUserProfile();
    if (localProfile) {
      try {
        await upsertRemoteUserProfile(userId, localProfile);
      } catch (profileErr) {
        console.warn('Profile sync skipped during migration (schema may be pending):', profileErr);
      }
    }

    onProgress?.('Migrating Drawing Sessions...', 30);
    const localSessions = loadStoredSessions();
    for (const session of localSessions) {
      try {
        await upsertRemoteSession(userId, session);
      } catch (sessErr) {
        console.warn('Session sync note during migration:', sessErr);
      }
    }

    onProgress?.('Migrating Challenges & Tasks...', 50);
    const localChallenges = loadStoredChallenges();
    for (const challenge of localChallenges) {
      try {
        await upsertRemoteChallenge(userId, challenge);
      } catch (chalErr) {
        console.warn('Challenge sync note during migration:', chalErr);
      }
    }

    onProgress?.('Migrating Artworks & Uploading Images...', 70);
    const localArtworks = loadStoredArtworks();
    for (const artwork of localArtworks) {
      let finalImageUrl = artwork.imageId;
      let storagePath: string | undefined;

      // Check if image blob exists in IndexedDB
      try {
        const blob = await getArtworkImageBlob(artwork.id);
        if (blob) {
          const uploadResult = await uploadArtworkToStorage(userId, artwork.id, blob);
          if (uploadResult) {
            finalImageUrl = uploadResult.signedUrl || uploadResult.publicUrl;
            storagePath = uploadResult.storagePath;
          }
        }
      } catch (imgErr) {
        console.warn(`Could not upload artwork image for ${artwork.id}:`, imgErr);
      }

      try {
        await upsertRemoteArtwork(userId, {
          ...artwork,
          imageId: finalImageUrl
        }, storagePath);
      } catch (artErr) {
        console.warn('Artwork sync note during migration:', artErr);
      }
    }

    onProgress?.('Migrating Studio Journal & Insights...', 85);
    const localInsights = loadStoredInsights();
    for (const insight of localInsights) {
      try {
        await upsertRemoteInsight(userId, insight);
      } catch (insErr) {
        console.warn('Insight sync note during migration:', insErr);
      }
    }

    onProgress?.('Syncing Milestones & Achievements...', 95);
    const localAchievements = loadStoredAchievements();
    try {
      await upsertRemoteAchievements(userId, localAchievements);
    } catch (achErr) {
      console.warn('Achievement sync note during migration:', achErr);
    }

    // Flag profile as migrated if profile table exists
    try {
      await supabase.from('profiles').update({ migrated_from_local: true }).eq('id', userId);
    } catch (e) {
      // safe fallback if column or table is pending
    }

    onProgress?.('Migration Complete!', 100);
    return { success: true };
  } catch (err: any) {
    console.error('Migration encountered error:', err);
    return { success: false, error: err?.message || 'Migration encountered an error' };
  }
}
