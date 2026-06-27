/* Push The Pin — behaviour event log types. PRS section 9. */

export type EventName =
  | 'app_open'
  | 'onboarding_step_reached'
  | 'onboarding_completed'
  | 'location_granted'
  | 'location_denied'
  | 'filter_changed'
  | 'pin_opened'
  | 'create_started'
  | 'create_completed'
  | 'create_abandoned'
  | 'civic_submitted'
  | 'civic_resolved'
  | 'collage_opened'
  | 'upvote_chosen'
  | 'add_photo_chosen'
  | 'building_joined'
  | 'building_registered'
  | 'survey_shown'
  | 'survey_answered'
  | 'survey_dismissed'
  | 'interested_tapped'
  | 'session_end'
  | 'data_reset';

export interface BehaviourEvent {
  id: string;
  name: EventName;
  at: string; // ISO
  payload?: Record<string, unknown>;
}
