import { PulpAPI } from './pulp';

const base = new PulpAPI();

export const TaskAPI = {
  get: (uuid) => base.http.get(`tasks/${uuid}/`),

  list: (params?) => base.list(`tasks/`, params),

  cancel: (uuid) => base.http.patch(`tasks/${uuid}/`, { state: 'canceled' }),

  purge: (data) => base.http.post(`tasks/purge/`, data),
};
