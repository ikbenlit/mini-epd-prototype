-- Check welke patiënten er in de database zitten
SELECT
  id,
  name_given,
  name_family,
  name_prefix,
  birth_date
FROM patients
ORDER BY created_at DESC
LIMIT 20;
