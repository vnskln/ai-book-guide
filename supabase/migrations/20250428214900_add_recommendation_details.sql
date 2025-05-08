-- Migration: add_recommendation_details
-- Description: Adds plot_summary and rationale columns to recommendations table
-- Created at: 2025-04-28 21:49:00 UTC
-- Author: AI Assistant

-- Add plot_summary and rationale columns to recommendations table
alter table "recommendations"
add column plot_summary text not null,
add column rationale text not null;

-- Add constraints to ensure reasonable text lengths
alter table "recommendations"
add constraint plot_summary_length check (length(plot_summary) <= 2000),
add constraint rationale_length check (length(rationale) <= 2000);

-- Add comments for the new columns
comment on column recommendations.plot_summary is 'AI-generated plot summary of the recommended book';
comment on column recommendations.rationale is 'AI-generated explanation of why this book was recommended'; 