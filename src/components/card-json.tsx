import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
} from '@patternfly/react-core';
import { useState } from 'react';
import { AsJSON } from 'src/components';

export const CardJSON = ({ data }: { data }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Card isExpanded={expanded}>
      <CardHeader onExpand={() => setExpanded(!expanded)}>
        <CardTitle onClick={() => setExpanded(!expanded)}>JSON</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>
          <AsJSON data={data} />
        </CardBody>
      </CardExpandableContent>
    </Card>
  );
};
