import AdminRolesView from 'components/team/AdminRolesView';

/* Sits under /users on purpose — it is who can get into the console, which is
   a User Management question. RouteGuard maps this path to the `team` section
   (longest href match beats /users), so an admin with access to Users cannot
   walk in here. */
export default function AdminRolesPage() {
  return <AdminRolesView />;
}
