import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from 'react-router';
import { FileRepositoryAPI } from 'src/api';
import { BaseHeader, Breadcrumbs, Pagination } from 'src/components';

export default function FileRepositoryIndex() {
  const { data } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const breadcrumbs = <Breadcrumbs links={[{ name: 'File Repositories' }]} />;

  const setPage = (page) => {
    setSearchParams(
      { ...Object.fromEntries(searchParams.entries()), page },
      { replace: true },
    );
  };
  const setPerPage = (_ev, page_size, page) => {
    setSearchParams(
      { ...Object.fromEntries(searchParams.entries()), page_size, page },
      { replace: true },
    );
  };

  const rows = data.results.map(({ uuid, name, description }) => (
    <Tr key={uuid}>
      <Td>
        <Link to={uuid}>{name}</Link>
      </Td>
      <Td>{description}</Td>
    </Tr>
  ));

  return (
    <>
      <BaseHeader title='File Repositories' breadcrumbs={breadcrumbs} />
      <Pagination
        itemCount={data.count}
        page={Number(searchParams.get('page')) || 1}
        perPage={Number(searchParams.get('page_size')) || 10}
        onSetPage={setPage}
        onPerPageSelect={setPerPage}
      />
      <Table>
        <Thead>
          <Tr>
            <Th>name</Th>
            <Th>description</Th>
          </Tr>
        </Thead>
        <Tbody>{rows}</Tbody>
      </Table>
    </>
  );
}

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const search = Object.fromEntries(url.searchParams.entries());
  //const search = new Proxy(url.searchParams, {})

  return FileRepositoryAPI.list(search).then(
    ({ data: { results, ...dataRest }, ...rest }) => ({
      ...rest,
      data: {
        ...dataRest,
        results: results.map(({ prn, ...Resultrest }) => ({
          ...Resultrest,
          prn,
          uuid: prn.split(':')[2],
        })),
      },
    }),
  );
};
