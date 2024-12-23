import { useLoaderData } from 'react-router';
import { FileRepositoryAPI } from 'src/api';
import { BaseHeader, Breadcrumbs } from 'src/components';

export default function FileRepositoryDetail() {
  const item = useLoaderData();
  const { name, uuid } = item;
  const breadcrumbs = (
    <Breadcrumbs
      links={[
        { name: 'file' },
        { name: 'repositories', url: '..' },
        { name: uuid },
      ]}
    />
  );

  return (
    <>
      <BaseHeader title={name} breadcrumbs={breadcrumbs} />
      <div>{JSON.stringify(item)}</div>;
    </>
  );
}

export const clientLoader = async ({ params }) => {
  const { uuid } = params;

  return FileRepositoryAPI.show(uuid).then(
    ({ data: { prn, ...Resultrest } }) => ({
      ...Resultrest,
      prn,
      uuid: prn.split(':')[2],
    }),
  );
};
