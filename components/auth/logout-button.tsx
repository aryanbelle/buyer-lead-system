import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">
        Logout
      </Button>
    </form>
  )
}
