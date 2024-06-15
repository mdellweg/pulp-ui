import React, { Component, type ElementType, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  type FeatureFlagsType,
  type SettingsType,
  type UserType,
} from 'src/api';
import {
  AppContext,
  type IAppContextType,
  useAppContext,
} from 'src/app-context';
import { type AlertType } from 'src/components';
import {
  AnsibleRemoteDetail,
  AnsibleRemoteEdit,
  AnsibleRemoteList,
  AnsibleRepositoryDetail,
  AnsibleRepositoryEdit,
  AnsibleRepositoryList,
  CertificationDashboard,
  CollectionContent,
  CollectionDependencies,
  CollectionDetail,
  CollectionDistributions,
  CollectionDocs,
  CollectionImportLog,
  EditNamespace,
  EditRole,
  EditUser,
  ExecutionEnvironmentDetail,
  ExecutionEnvironmentDetailAccess,
  ExecutionEnvironmentDetailActivities,
  ExecutionEnvironmentDetailImages,
  ExecutionEnvironmentList,
  ExecutionEnvironmentManifest,
  ExecutionEnvironmentRegistryList,
  GroupDetail,
  GroupList,
  LoginPage,
  MultiSearch,
  MyImports,
  MyNamespaces,
  NamespaceDetail,
  NotFound,
  Partners,
  PulpStatus,
  RoleCreate,
  RoleList,
  Search,
  SignatureKeysList,
  TaskDetail,
  TaskListView,
  Token,
  UserCreate,
  UserDetail,
  UserList,
  UserProfile,
} from 'src/containers';
import { loadContext } from 'src/load-context';
import { Paths, formatPath } from 'src/paths';
import { loginURL } from 'src/utilities';

type UpdateInitialData = (
  data: {
    user?: UserType;
    featureFlags?: FeatureFlagsType;
    settings?: SettingsType;
    alerts?: AlertType[];
  },
  callback?: () => void,
) => void;

interface IRoutesProps {
  updateInitialData: UpdateInitialData;
}

interface IAuthHandlerProps {
  component: ElementType;
  isDisabled?: boolean;
  noAuth: boolean;
  updateInitialData: UpdateInitialData;
  path: string;
}

interface IRouteConfig {
  component: ElementType;
  path: string;
  noAuth?: boolean;
  isDisabled?: boolean;
}

const AuthHandler = ({
  component: Component,
  isDisabled,
  noAuth,
  path,
  updateInitialData,
}: IAuthHandlerProps) => {
  const { user, settings, featureFlags } = useAppContext();
  const [isLoading, setLoading] = useState<boolean>(
    !user || !settings || !featureFlags,
  );
  const { pathname } = useLocation();

  useEffect(() => {
    // This component is mounted on every route change, so it's a good place
    // to check for an active user.
    if (user && settings && featureFlags) {
      return;
    }

    loadContext()
      .then((data) => updateInitialData(data))
      .then(() => setLoading(false));
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user && !noAuth) {
    const isExternalAuth = featureFlags.external_authentication;
    // NOTE: also update LoginLink when changing this
    if (isExternalAuth && UI_EXTERNAL_LOGIN_URI) {
      window.location.replace(loginURL(pathname));
      return null;
    }

    return <Navigate to={formatPath(Paths.login, {}, { next: pathname })} />;
  }

  // only enforce this if feature flags are set. Otherwise the container
  // registry will always return a 404 on the first load.
  if (isDisabled) {
    return <NotFound path={path} />;
  }

  return <Component path={path} />;
};

export class StandaloneRoutes extends Component<IRoutesProps> {
  static contextType = AppContext;

  // Note: must be ordered from most specific to least specific
  getRoutes(): IRouteConfig[] {
    const { featureFlags, user } = this.context as IAppContextType;

    let isContainerDisabled = true;
    let isUserMgmtDisabled = false;
    if (featureFlags) {
      isContainerDisabled = !featureFlags.execution_environments;
      isUserMgmtDisabled = featureFlags.external_authentication;
    }

    return [
      {
        component: ExecutionEnvironmentDetailActivities,
        path: Paths.executionEnvironmentDetailActivities,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailAccess,
        path: Paths.executionEnvironmentDetailAccess,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentManifest,
        path: Paths.executionEnvironmentManifest,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetailImages,
        path: Paths.executionEnvironmentDetailImages,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentDetail,
        path: Paths.executionEnvironmentDetail,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentList,
        path: Paths.executionEnvironments,
        isDisabled: isContainerDisabled,
      },
      {
        component: ExecutionEnvironmentRegistryList,
        path: Paths.executionEnvironmentsRegistries,
        isDisabled: isContainerDisabled,
      },
      {
        component: TaskListView,
        path: Paths.taskList,
      },
      { component: GroupList, path: Paths.groupList },
      { component: GroupDetail, path: Paths.groupDetail },
      { component: TaskDetail, path: Paths.taskDetail },
      { component: EditRole, path: Paths.roleEdit },
      {
        component: RoleCreate,
        path: Paths.createRole,
        isDisabled: !user?.is_superuser,
      },
      { component: RoleList, path: Paths.roleList },
      { component: AnsibleRemoteDetail, path: Paths.ansibleRemoteDetail },
      { component: AnsibleRemoteEdit, path: Paths.ansibleRemoteEdit },
      { component: AnsibleRemoteList, path: Paths.ansibleRemotes },
      {
        component: AnsibleRepositoryDetail,
        path: Paths.ansibleRepositoryDetail,
      },
      {
        component: AnsibleRepositoryEdit,
        path: Paths.ansibleRepositoryEdit,
      },
      { component: AnsibleRepositoryList, path: Paths.ansibleRepositories },
      { component: UserProfile, path: Paths.userProfileSettings },
      {
        component: UserCreate,
        path: Paths.createUser,
        isDisabled: isUserMgmtDisabled,
      },
      { component: SignatureKeysList, path: Paths.signatureKeys },
      {
        component: EditUser,
        path: Paths.editUser,
        isDisabled: isUserMgmtDisabled,
      },
      { component: UserDetail, path: Paths.userDetail },
      { component: UserList, path: Paths.userList },
      { component: CertificationDashboard, path: Paths.approvalDashboard },
      { component: NotFound, path: Paths.notFound },
      { component: Token, path: Paths.token },
      { component: Partners, path: Paths.namespaces },
      { component: EditNamespace, path: Paths.editNamespace },
      { component: MyNamespaces, path: Paths.myNamespaces },
      { component: LoginPage, path: Paths.login, noAuth: true },
      { component: CollectionDocs, path: Paths.collectionDocsPage },
      { component: CollectionDocs, path: Paths.collectionDocsIndex },
      { component: CollectionDocs, path: Paths.collectionContentDocs },
      { component: CollectionContent, path: Paths.collectionContentList },
      { component: CollectionImportLog, path: Paths.collectionImportLog },
      {
        component: CollectionDistributions,
        path: Paths.collectionDistributions,
      },
      {
        component: CollectionDependencies,
        path: Paths.collectionDependencies,
      },
      { component: CollectionDetail, path: Paths.collection },
      { component: Search, path: Paths.collections },
      { component: MyImports, path: Paths.myImports },
      { component: NamespaceDetail, path: Paths.namespaceDetail },
      { component: Search, path: Paths.collections },
      { component: PulpStatus, path: Paths.status },
      { component: MultiSearch, path: Paths.search },
    ];
  }

  render() {
    const { updateInitialData } = this.props;

    return (
      <Routes>
        {this.getRoutes().map(
          ({ component, isDisabled, noAuth, path }, index) => (
            <Route
              element={
                <AuthHandler
                  component={component}
                  isDisabled={isDisabled}
                  noAuth={noAuth}
                  path={path}
                  updateInitialData={updateInitialData}
                />
              }
              key={index}
              path={path}
            />
          ),
        )}
        <Route
          path='*'
          element={
            <AuthHandler
              component={NotFound}
              noAuth
              path={null}
              updateInitialData={updateInitialData}
            />
          }
        />
      </Routes>
    );
  }
}
