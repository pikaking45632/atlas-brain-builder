import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface WaitlistConfirmationProps {
  company_name?: string | null
}

const WaitlistConfirmationEmail = ({ company_name }: WaitlistConfirmationProps) => {
  const greetingName = company_name && company_name.trim().length > 0 ? company_name : 'there'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You're on the Atlas waitlist</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're on the list.</Heading>
          <Text style={text}>Hi {greetingName},</Text>
          <Text style={text}>
            Thanks for putting your name down for Atlas — the workplace that
            thinks with you.
          </Text>
          <Text style={text}>
            We're letting in early customers in small batches as we make sure
            Atlas works the way it should for each business. You'll hear from
            us when it's your turn.
          </Text>
          <Text style={text}>
            In the meantime, if you'd like to fast-track a conversation about
            a pilot, just reply to this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Atlas Intelligence Systems Ltd · Scotland, UK
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WaitlistConfirmationEmail,
  subject: "You're on the Atlas waitlist",
  displayName: 'Waitlist confirmation',
  previewData: { company_name: 'Acme Co' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}
const container = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '40px 24px',
  color: '#0f172a',
}
const h1 = {
  fontSize: '24px',
  fontWeight: '600' as const,
  letterSpacing: '-0.02em',
  margin: '0 0 16px',
  color: '#0f172a',
}
const text = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#334155',
  margin: '0 0 16px',
}
const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0 16px',
}
const footer = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#64748b',
  margin: '0',
}