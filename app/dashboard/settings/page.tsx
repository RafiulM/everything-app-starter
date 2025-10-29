import Link from "next/link"
import {
  IconKey,
  IconUser,
  IconBell,
  IconShield,
  IconChevronRight
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const settingsSections = [
  {
    title: "API Keys",
    description: "Manage your API keys for external services",
    href: "/dashboard/settings/keys",
    icon: IconKey,
    color: "text-blue-600"
  },
  {
    title: "Profile",
    description: "Manage your profile information and preferences",
    href: "/dashboard/settings/profile",
    icon: IconUser,
    color: "text-green-600"
  },
  {
    title: "Notifications",
    description: "Configure notification preferences",
    href: "/dashboard/settings/notifications",
    icon: IconBell,
    color: "text-yellow-600"
  },
  {
    title: "Security",
    description: "Manage security settings and authentication",
    href: "/dashboard/settings/security",
    icon: IconShield,
    color: "text-red-600"
  }
]

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  {section.title}
                </CardTitle>
                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}