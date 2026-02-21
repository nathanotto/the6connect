-- Update support_type check constraint to match simplified check-in form
-- Old values: Listen, Support, Advise, Hug Me, Other
-- New values: Just read this, Listen, Respond, Be supportive, Advise, Other

ALTER TABLE life_status_updates DROP CONSTRAINT life_status_updates_support_type_check;

ALTER TABLE life_status_updates ADD CONSTRAINT life_status_updates_support_type_check
  CHECK (support_type = ANY (ARRAY[
    'Just read this'::text,
    'Listen'::text,
    'Respond'::text,
    'Be supportive'::text,
    'Advise'::text,
    'Other'::text
  ]));
