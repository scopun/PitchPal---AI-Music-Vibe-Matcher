import StaticContentPage from '../components/StaticContentPage'

interface PageProps {
  isDark: boolean
  onToggleTheme: () => void
}

export default function TermsOfServicePage({ isDark, onToggleTheme }: PageProps) {
  return (
    <StaticContentPage
      isDark={isDark}
      onToggleTheme={onToggleTheme}
      headingPrefix="Terms of"
      headingGradient="Service"
      tagline="The agreement between you and PitchPal — written plainly so you know what you're signing up for"
      bodyHeading="What you can expect, and what we ask of you"
      bodyParagraphs={[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
        "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      ]}
    />
  )
}
