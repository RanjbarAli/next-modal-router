import { CloseButton } from "../../../components/close-button";
export default function NotificationsDrawer() { return <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="notifications-title" data-testid="notifications-drawer"><CloseButton /><h2 id="notifications-title">Notifications</h2><p>A separate @panel slot can remain independent from @modal.</p></aside>; }
