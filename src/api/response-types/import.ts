import { type TaskStatus } from './pulp';

export class ImportListType {
  id: number;
  state: TaskStatus;
  started_at: string;
  finished_at: string;
  namespace: string;
  // Collection name
  name: string;
  version: string;
  collectionRepo: string;
}

export class ImportDetailType extends ImportListType {
  error?: {
    code: string;
    description: string;
    traceback: string;
  };

  job_id: string;
  imported_version: string;
  messages: {
    level: string;
    message: string;
    time: string;
  }[];
}
