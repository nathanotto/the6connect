/**
 * Game Activity Logger
 *
 * Logs game updates to the activity_log table.
 * Used for Recent Updates, Staleness Alerts, and post-game visualization.
 * Fire-and-forget: logging failures never break the main operation.
 */

type SupabaseClient = any;

export async function logGameActivity(
  supabase: SupabaseClient,
  userId: string,
  activityType: string,
  gameId: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      activity_type: activityType,
      entity_type: 'games',
      entity_id: gameId,
      metadata,
    });
  } catch {
    // Silently fail — logging must never break the main operation
  }
}

/**
 * Formats an activity log entry into a human-readable string.
 * Used for the Recent Updates display on the game overview page.
 */
export function formatActivityMessage(activityType: string, metadata: any): string {
  const desc = metadata?.description ? ` "${metadata.description.slice(0, 50)}"` : '';

  switch (activityType) {
    case 'game_vision_updated':
      return `updated Vision to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_why_updated':
      return `updated Why to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_objective_updated':
      return `updated Objective to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_key_result_updated':
      return `updated Key Result to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_key_result_added':
      return `added a Key Result${desc}`;
    case 'game_key_result_deleted':
      return `deleted a Key Result${desc}`;
    case 'game_project_updated':
      return `updated a Project to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_project_added':
      return `added a Project${desc}`;
    case 'game_project_deleted':
      return `deleted a Project${desc}`;
    case 'game_inner_game_updated':
      return `updated ${metadata?.item_type} item (${metadata?.category}) to ${metadata?.rating}/5`;
    case 'game_inner_game_added':
      return `added ${metadata?.item_type} item (${metadata?.category})${desc}`;
    case 'game_inner_game_deleted':
      return `deleted an Inner Game item${desc}`;
    case 'game_obt_updated':
      return `updated OBT Week ${metadata?.week_number} to ${metadata?.completion_percentage ?? 0}%`;
    case 'game_vision_text_updated':
      return `updated their Vision statement`;
    case 'game_why_text_updated':
      return `updated their Why statement`;
    case 'game_objective_text_updated':
      return `updated their Objective`;
    case 'game_obt_text_updated':
      return `updated OBT Week ${metadata?.week_number} description`;
    case 'game_key_result_text_updated':
      return `updated a Key Result description${desc}`;
    case 'game_project_text_updated':
      return `updated a Project description${desc}`;
    case 'game_inner_game_text_updated':
      return `updated ${metadata?.item_type} item (${metadata?.category}) description${desc}`;
    case 'game_key_result_notes_updated':
      return `updated Key Result notes${desc}`;
    case 'game_obt_notes_updated':
      return `updated OBT Week ${metadata?.week_number} notes`;
    case 'game_setup_completed':
      return `completed their game setup`;
    case 'game_name_updated':
      return `named their game "${metadata?.game_name}"`;
    default:
      return `updated their game`;
  }
}
