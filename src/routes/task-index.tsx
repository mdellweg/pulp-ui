import { t } from '@lingui/core/macro';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { useState } from 'react';
import {
  type ActionFunctionArgs,
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router';
import { OrphanCleanupAPI, RepairAPI, TaskAPI, type TaskStatus } from 'src/api';
import {
  AlertList,
  AppliedFilters,
  BaseHeader,
  CardJSON,
  CompoundFilter,
  DateComponent,
  EmptyStateFilter,
  EmptyStateNoData,
  type FilterOption,
  Main,
  PulpPagination,
  SortTable,
  StatusIndicator,
  closeAlert,
} from 'src/components';
import { OrphanCleanupTaskModal } from 'src/components/orphan-cleanup-task-modal';
import { PurgeTaskModal } from 'src/components/purge-task-modal';
import { RepairTaskModal } from 'src/components/repair-task-modal';
import { Paths, formatPath } from 'src/paths';
import { filterIsSet, parsePulpIDFromURL, translateTask } from 'src/utilities';

interface ITask {
  name: string;
  state: TaskStatus;
  pulp_created: string;
  started_at: string;
  finished_at: string;
  pulp_href: string;
}

const ORPHAN_PROTECTION_TIME = 1440;

const TaskTableRow = ({ item }: { item: ITask }) => {
  const { name, state, pulp_created, started_at, finished_at, pulp_href } =
    item;
  const taskId = parsePulpIDFromURL(pulp_href);
  const description = translateTask(name);

  return (
    <Tr>
      <Td>
        <Link to={formatPath(Paths.core.task.detail, { task: taskId })}>
          {name}
        </Link>
      </Td>
      <Td>{description !== name ? description : null}</Td>
      <Td>
        <DateComponent date={pulp_created} />
      </Td>
      <Td>
        <DateComponent date={started_at} />
      </Td>
      <Td>
        <DateComponent date={finished_at} />
      </Td>
      <Td>
        <StatusIndicator status={state} />
      </Td>
      <Td>cancel</Td>
    </Tr>
  );
};

const TaskTable = ({
  items,
  params,
  setParams,
}: {
  items: ITask[];
  params;
  setParams;
}) => {
  if (items.length === 0) {
    return <EmptyStateFilter />;
  }

  const sortTableOptions = {
    headers: [
      {
        title: t`Task name`,
        type: 'alpha',
        id: 'name',
      },
      {
        title: t`Description`,
        type: 'none',
        id: 'description',
      },
      {
        title: t`Created on`,
        type: 'numeric',
        id: 'pulp_created',
      },
      {
        title: t`Started at`,
        type: 'numeric',
        id: 'started_at',
      },
      {
        title: t`Finished at`,
        type: 'numeric',
        id: 'finished_at',
      },
      {
        title: t`Status`,
        type: 'alpha',
        id: 'state',
      },
    ],
  };
  return (
    <Table aria-label={t`Task list`}>
      <SortTable
        options={sortTableOptions}
        params={params}
        updateParams={setParams}
      />
      <Tbody>
        {items.map((item) => (
          <TaskTableRow key={item.pulp_href} item={item} />
        ))}
      </Tbody>
    </Table>
  );
};

export default function TaskList() {
  // Pseudo constant
  const today = new Date(); // This is a slight violation of the pure function paradigm.

  // Hooks
  const [searchParams, setSearchParams] = useSearchParams({
    page: '1',
    page_size: '10',
    sort: '-pulp_created',
  });
  const { data } = useLoaderData();
  const [alerts, setAlerts] = useState([]);
  const [filterInputText, setFilterInputText] = useState('');
  const [orphanCleanupTaskModalVisible, setOrphanCleanupTaskModalVisible] =
    useState(false);
  const [orphanCleanupTaskBody, setOrphanCleanupTaskBody] = useState({
    orphan_protection_time: ORPHAN_PROTECTION_TIME,
  });
  const [repairTaskModalVisible, setRepairTaskModalVisible] = useState(false);
  const [repairTaskBody, setRepairTaskBody] = useState({
    verify_checksums: true,
  });
  const [purgeTaskBody, setPurgeTaskBody] = useState({
    finished_before: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
    states: ['completed'],
  });
  const [purgeTaskModalVisible, setPurgeTaskModalVisible] = useState(false);

  // Derived values
  // Adapt searchParams to params
  const params = { ...Object.fromEntries(searchParams.entries()) };
  const setParams = (p) => {
    console.log(p);
    setSearchParams(p);
  };
  const noData =
    data.count === 0 && !filterIsSet(params, ['name__contains', 'state']);

  // Helpers and Handlers
  const addAlert = (title, variant, description?) => {
    setAlerts((currentAlerts) => [
      ...currentAlerts,
      { description, title, variant },
    ]);
  };

  const onOrphanCleanup = (body: { orphan_protection_time: number }) => {
    OrphanCleanupAPI.create(body)
      .then(() => addAlert(t`Orphan cleanup started`, 'success'))
      .catch(() => addAlert(t`Orphan cleanup could not be started`, 'danger'));
  };

  const onRepair = (body: { verify_checksums: boolean }) => {
    RepairAPI.create(body)
      .then(() => addAlert(t`Repair Artifact Storage started`, 'success'))
      .catch(() =>
        addAlert(t`Repair Artifact Storage could not be started`, 'danger'),
      );
  };

  const onPurgeTasks = (body: {
    finished_before: string;
    states: string[];
  }) => {
    TaskAPI.purge(body)
      .then(() => addAlert(t`Purge Tasks started`, 'success'))
      .catch(() => addAlert(t`Purge Tasks could not be started`, 'danger'));
  };

  // RenderSnippets
  const orphansCleanup = (
    <>
      <Button
        variant={'primary'}
        onClick={() => setOrphanCleanupTaskModalVisible(true)}
      >{t`Orphan cleanup`}</Button>
      {orphanCleanupTaskModalVisible && (
        <OrphanCleanupTaskModal
          taskValue={orphanCleanupTaskBody}
          cancelAction={() => setOrphanCleanupTaskModalVisible(false)}
          confirmAction={() => {
            onOrphanCleanup(orphanCleanupTaskBody);
            setOrphanCleanupTaskModalVisible(false);
          }}
          updateTask={setOrphanCleanupTaskBody}
        />
      )}
    </>
  );
  const repair = (
    <>
      <Button
        variant={'primary'}
        onClick={() => setRepairTaskModalVisible(true)}
      >{t`Repair`}</Button>
      {repairTaskModalVisible && (
        <RepairTaskModal
          taskValue={repairTaskBody}
          cancelAction={() => setRepairTaskModalVisible(false)}
          confirmAction={() => {
            onRepair(repairTaskBody);
            setRepairTaskModalVisible(false);
          }}
          updateTask={setRepairTaskBody}
        />
      )}
    </>
  );
  const purgeTasks = (
    <>
      <Button
        variant={'primary'}
        onClick={() => setPurgeTaskModalVisible(true)}
      >{t`Purge tasks`}</Button>
      {purgeTaskModalVisible && (
        <PurgeTaskModal
          taskValue={purgeTaskBody}
          cancelAction={() => setPurgeTaskModalVisible(false)}
          confirmAction={() => {
            onPurgeTasks(purgeTaskBody);
            setPurgeTaskModalVisible(false);
          }}
          updateTask={setPurgeTaskBody}
        />
      )}
    </>
  );

  const filterConfig: FilterOption[] = [
    {
      id: 'name__contains',
      title: t`Task name`,
    },
    {
      id: 'state',
      title: t`Status`,
      inputType: 'select',
      options: [
        {
          id: 'completed',
          title: t`Completed`,
        },
        {
          id: 'failed',
          title: t`Failed`,
        },
        {
          id: 'running',
          title: t`Running`,
        },
        {
          id: 'waiting',
          title: t`Waiting`,
        },
      ],
    },
  ];

  return (
    <>
      <AlertList
        alerts={alerts}
        closeAlert={(i) =>
          closeAlert(i, {
            alerts,
            setAlerts,
          })
        }
      />
      <BaseHeader title={t`Task management`} />
      {noData ? (
        <EmptyStateNoData
          title={t`No tasks yet`}
          description={t`Tasks will appear once created.`}
        />
      ) : (
        <Main>
          <section className='pulp-section'>
            <div className='pulp-toolbar'>
              <Toolbar>
                <ToolbarContent>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <CompoundFilter
                        inputText={filterInputText}
                        onChange={setFilterInputText}
                        updateParams={setParams}
                        params={params}
                        filterConfig={filterConfig}
                      />
                    </ToolbarItem>
                    <ToolbarItem>{orphansCleanup}</ToolbarItem>
                    <ToolbarItem>{repair}</ToolbarItem>
                    <ToolbarItem>{purgeTasks}</ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
              <PulpPagination
                params={params}
                updateParams={setParams}
                count={data.count}
                isTop
              />
            </div>
            <div>
              <AppliedFilters
                updateParams={(p) => {
                  setParams(p);
                  setFilterInputText('');
                }}
                params={params}
                ignoredParams={['page_size', 'page', 'sort']}
                niceNames={{
                  name__contains: t`Task name`,
                  state: t`Status`,
                }}
              />
            </div>
            <TaskTable
              items={data.results}
              params={params}
              setParams={setParams}
            />
            <PulpPagination
              params={params}
              updateParams={setParams}
              count={data.count}
            />
          </section>
          <CardJSON data={data} />
          <CardJSON data={params} />
        </Main>
      )}
    </>
  );
}

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = Object.fromEntries(url.searchParams.entries());

  const {
    data: { results, ...dataRest },
    ...rest
  } = await TaskAPI.list(search);
  return {
    ...rest,
    data: {
      ...dataRest,
      results: results.map(({ prn, ...itemRest }) => ({
        prn,
        uuid: prn.split(':')[2],
        ...itemRest,
      })),
    },
  };
};

export const clientAction = async ({ request }: ActionFunctionArgs) => {
  console.log(request);
};
