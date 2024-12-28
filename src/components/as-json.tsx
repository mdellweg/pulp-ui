export const AsJSON = ({ data }: { data }) => (
  <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
);
