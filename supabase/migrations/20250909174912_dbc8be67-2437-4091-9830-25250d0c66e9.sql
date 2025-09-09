-- Create database function to get stale contacts
CREATE OR REPLACE FUNCTION get_stale_contacts(user_id_param UUID, days_threshold INTEGER DEFAULT 14)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  days_since_last_contact INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    COALESCE(
      EXTRACT(DAY FROM (NOW() - MAX(ca.activity_date)))::INTEGER,
      EXTRACT(DAY FROM (NOW() - c.created_at))::INTEGER
    ) as days_since_last_contact
  FROM contacts c
  LEFT JOIN contact_activities ca ON c.id = ca.contact_id AND ca.user_id = user_id_param
  WHERE c."userId" = user_id_param
  GROUP BY c.id, c.first_name, c.last_name, c.email, c.created_at
  HAVING 
    COALESCE(
      EXTRACT(DAY FROM (NOW() - MAX(ca.activity_date)))::INTEGER,
      EXTRACT(DAY FROM (NOW() - c.created_at))::INTEGER
    ) >= days_threshold
  ORDER BY days_since_last_contact DESC
  LIMIT 10;
END;
$$;