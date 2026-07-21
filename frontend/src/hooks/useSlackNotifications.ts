import { useApiData } from "./useApiData";
import { getSlackNotifications, getSlackOverview } from "../services/slackService";
import type { SlackNotification, SlackOverview } from "../types/slack";

export function useSlackNotifications() {
  const notifications = useApiData<SlackNotification[]>(getSlackNotifications);
  const overview = useApiData<SlackOverview>(getSlackOverview);

  const loading = notifications.loading || overview.loading;
  const error = notifications.error || overview.error;
  const refetch = () => { notifications.refetch(); overview.refetch(); };

  return {
    notifications: notifications.data || [],
    overview: overview.data || null,
    loading,
    error,
    refetch,
  };
}
