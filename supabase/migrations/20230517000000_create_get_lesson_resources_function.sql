
-- Function to get lesson resources by lesson plan id
CREATE OR REPLACE FUNCTION get_lesson_resources_by_lesson_id(p_lesson_plan_id UUID)
RETURNS SETOF lesson_resources
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM lesson_resources
  WHERE lesson_plan_id = p_lesson_plan_id;
END;
$$;
