-- Resident login is flat-number-only with no society selector, and
-- get_resident_portal() looks up a flat by number across ALL societies.
-- A per-society unique constraint let two different societies register the
-- same flat number, so the RPC's `limit 1` could silently return a flat
-- belonging to a different society than the resident intended. Until
-- resident login carries a society identifier, flat numbers must be
-- unique instance-wide.

alter table public.flats drop constraint flats_society_id_flat_number_key;
alter table public.flats add constraint flats_flat_number_key unique (flat_number);
