'use server';
/**
 * @fileOverview An AI-powered tool for administrators to analyze historical library visit logs
 * and generate textual summaries of trends, such as peak visiting hours, most popular reasons for visits,
 * or department-specific visitor patterns over a chosen period.
 *
 * - analyzeVisitorTrends - A function that handles the visitor trend analysis process.
 * - VisitorTrendAnalysisInput - The input type for the analyzeVisitorTrends function.
 * - VisitorTrendAnalysisOutput - The return type for the analyzeVisitorTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisitorLogEntrySchema = z.object({
  timestamp: z
    .string()
    .describe('The timestamp of the visit in ISO 8601 format (e.g., "2023-10-27T10:30:00Z").'),
  reasonForVisiting: z.string().describe('The reason the user visited the library (e.g., "Reading", "Research").'),
  collegeOrOffice: z
    .string()
    .describe('The college or office of the visitor (e.g., "College of Law", "Integrated School").'),
});

const VisitorTrendAnalysisInputSchema = z.object({
  visitLogs: z.array(VisitorLogEntrySchema).describe('An array of historical library visit log entries.'),
  timePeriodDescription: z
    .string()
    .describe(
      'A descriptive string indicating the time period covered by the visit logs (e.g., "the last month", "yesterday", "October 2023").'
    ),
});
export type VisitorTrendAnalysisInput = z.infer<typeof VisitorTrendAnalysisInputSchema>;

const VisitorTrendAnalysisOutputSchema = z.object({
  summary: z.string().describe('A comprehensive textual summary of the analyzed library usage trends.'),
  peakHours: z
    .array(z.string())
    .optional()
    .describe('An array of identified peak visiting hours or periods (e.g., ["10 AM - 12 PM", "3 PM - 5 PM"]).'),
  mostPopularReasons: z
    .array(z.object({reason: z.string(), count: z.number()}))
    .optional()
    .describe('An array of the most popular reasons for visiting and their counts.'),
  departmentTrends: z
    .array(z.object({collegeOrOffice: z.string(), summary: z.string()}))
    .optional()
    .describe('An array of summaries for each department or college, highlighting specific usage patterns.'),
});
export type VisitorTrendAnalysisOutput = z.infer<typeof VisitorTrendAnalysisOutputSchema>;

export async function analyzeVisitorTrends(
  input: VisitorTrendAnalysisInput
): Promise<VisitorTrendAnalysisOutput> {
  return visitorTrendAnalysisFlow(input);
}

const visitorTrendAnalysisPrompt = ai.definePrompt({
  name: 'visitorTrendAnalysisPrompt',
  input: {schema: VisitorTrendAnalysisInputSchema},
  output: {schema: VisitorTrendAnalysisOutputSchema},
  prompt: `You are an expert library usage analyst. Your task is to analyze the provided library visit logs for the period described as "{{{timePeriodDescription}}}" and identify key trends.

Here are the visit logs:
{{#each visitLogs}}
- Timestamp: {{{timestamp}}}, Reason: "{{{reasonForVisiting}}}", Department: "{{{collegeOrOffice}}}"
{{/each}}

Based on the logs, provide a comprehensive summary of library usage trends. Identify:
1.  **Peak visiting hours/periods**: What times of day or specific hours see the most activity?
2.  **Most popular reasons for visits**: Which reasons are chosen most frequently by visitors?
3.  **Department-specific visitor patterns**: Are there any noticeable trends or differences in how various colleges/offices use the library?

Format your output as a JSON object strictly adhering to the following schema:
${'```json'}
{{jsonSchema output}}
${'```'}`,
});

const visitorTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'visitorTrendAnalysisFlow',
    inputSchema: VisitorTrendAnalysisInputSchema,
    outputSchema: VisitorTrendAnalysisOutputSchema,
  },
  async input => {
    const {output} = await visitorTrendAnalysisPrompt(input);
    return output!;
  }
);
