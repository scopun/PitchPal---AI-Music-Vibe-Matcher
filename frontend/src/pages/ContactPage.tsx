import StaticContentPage from '../components/StaticContentPage'

interface PageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function ContactPage({ isDark, onToggleTheme }: PageProps) {
  return (
    <StaticContentPage
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      headingPrefix="Contact"
      headingGradient="us"
      tagline="Questions, feedback, or partnership ideas? We'd love to hear from you"
      bodyHeading="Get in touch with the PitchPal team"
      bodyParagraphs={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. For press inquiries, partnerships, or general questions reach out and our team will get back to you within two business days.",
      ]}
    />
  )
}
