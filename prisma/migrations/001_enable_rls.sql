-- Enable Row Level Security on all tables
-- This migration should be run in Supabase SQL Editor

-- Enable RLS on Event table
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;

-- Public read access: only PUBLISHED events are visible
CREATE POLICY "Public events are viewable by everyone"
  ON "Event" FOR SELECT
  USING (status = 'PUBLISHED');

-- Service role has full access for ingestion and moderation
CREATE POLICY "Service role has full access to events"
  ON "Event" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can insert events with PENDING status (for future admin features)
CREATE POLICY "Authenticated users can submit pending events"
  ON "Event" FOR INSERT
  TO authenticated
  WITH CHECK (status = 'PENDING');


-- Enable RLS on Venue table
ALTER TABLE "Venue" ENABLE ROW LEVEL SECURITY;

-- Public read access to all venues (needed for displaying event locations)
CREATE POLICY "Venues are viewable by everyone"
  ON "Venue" FOR SELECT
  USING (true);

-- Service role has full access
CREATE POLICY "Service role has full access to venues"
  ON "Venue" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Enable RLS on Source table
ALTER TABLE "Source" ENABLE ROW LEVEL SECURITY;

-- Sources are not publicly readable (internal configuration)
CREATE POLICY "Sources are only accessible by service role"
  ON "Source" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Enable RLS on MetricsEvent table
ALTER TABLE "MetricsEvent" ENABLE ROW LEVEL SECURITY;

-- Anyone can insert metrics (for anonymous tracking)
CREATE POLICY "Anyone can insert metrics"
  ON "MetricsEvent" FOR INSERT
  WITH CHECK (true);

-- Only service role can read metrics (for dashboard/analytics)
CREATE POLICY "Service role can read metrics"
  ON "MetricsEvent" FOR SELECT
  TO service_role
  USING (true);

-- Service role can update metrics (for daily aggregation)
CREATE POLICY "Service role can update metrics"
  ON "MetricsEvent" FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Enable RLS on Newsletter table
ALTER TABLE "Newsletter" ENABLE ROW LEVEL SECURITY;

-- Only service role can manage newsletters
CREATE POLICY "Service role has full access to newsletters"
  ON "Newsletter" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Enable RLS on Subscriber table
ALTER TABLE "Subscriber" ENABLE ROW LEVEL SECURITY;

-- Users can insert their own subscription (with confirmation required)
CREATE POLICY "Anyone can subscribe"
  ON "Subscriber" FOR INSERT
  WITH CHECK (true);

-- Users can read their own subscription (by email - requires auth in future)
CREATE POLICY "Users can read own subscription"
  ON "Subscriber" FOR SELECT
  USING (true); -- In future: add WHERE email = auth.jwt() -> 'email'

-- Users can update their own subscription (unsubscribe)
CREATE POLICY "Users can update own subscription"
  ON "Subscriber" FOR UPDATE
  USING (true); -- In future: add WHERE email = auth.jwt() -> 'email'
  WITH CHECK (true);

-- Service role has full access
CREATE POLICY "Service role has full access to subscribers"
  ON "Subscriber" FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- Grant necessary permissions
GRANT SELECT ON "Event" TO anon, authenticated;
GRANT SELECT ON "Venue" TO anon, authenticated;
GRANT INSERT ON "MetricsEvent" TO anon, authenticated;
GRANT INSERT ON "Subscriber" TO anon, authenticated;
GRANT SELECT, UPDATE ON "Subscriber" TO authenticated;
