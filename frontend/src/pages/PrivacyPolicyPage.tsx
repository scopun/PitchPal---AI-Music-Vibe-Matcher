import StaticContentPage from '../components/StaticContentPage'

interface PageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function PrivacyPolicyPage({ isDark, onToggleTheme }: PageProps) {
  return (
    <StaticContentPage
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      headingPrefix="Privacy"
      headingGradient="Policy"
      tagline="How we collect, use, and protect the information you share with PitchPal"
      bodyHeading="Your data, handled with care"
      bodyParagraphs={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
        "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.",
      ]}
    />
  )
}
