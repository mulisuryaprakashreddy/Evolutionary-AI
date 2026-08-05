/*
# Revoke public EXECUTE on trigger helper functions

The SECURITY DEFINER trigger functions (increment/decrement vote and comment
counters, handle_new_user) are only meant to run via table triggers, not via
the REST API. The default Postgres grants allow anon to call them through
/rest/v1/rpc/. Revoke EXECUTE from anon and authenticated to close that path.

No data changes. No table or column changes.
*/

REVOKE EXECUTE ON FUNCTION public.increment_report_vote() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_report_vote() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_report_comment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_report_comment() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
