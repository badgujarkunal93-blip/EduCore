import { useLiveSubscription } from "./useLiveSubscription";
import dataService from "../services/dataService";

export function useWorkspaceGroup(groupId) {
  return useLiveSubscription(
    (callback) => dataService.subscribeGroup(groupId, callback),
    [groupId],
    null,
  );
}
