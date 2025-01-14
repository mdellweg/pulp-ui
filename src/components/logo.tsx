import { useState } from 'react';
import PulpLogo from 'static/images/pulp_logo.png';

interface IProps {
  alt: string;
  className?: string;
  fallbackToDefault?: boolean;
  flexGrow?: boolean;
  image: string;
  // size should be css length measurment: '100px'
  size: string;
  unlockWidth?: boolean;
  width?: string;
}

export const Logo = ({
  alt,
  className,
  fallbackToDefault,
  flexGrow,
  image,
  size,
  unlockWidth,
  width,
}: IProps) => {
  const [failed, setFailed] = useState(false);

  const style = {
    height: size,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width,
  };

  if (flexGrow) {
    style['flexGrow'] = 1;
  }

  if (unlockWidth) {
    style['minWidth'] = size;
  } else {
    style['width'] = size;
  }

  // use inline css so we can set size
  return (
    <div className={className} style={style}>
      <img
        style={{ objectFit: 'contain', maxHeight: size }}
        src={failed ? PulpLogo : image || PulpLogo}
        alt={alt}
        onError={fallbackToDefault ? () => setFailed(true) : () => null}
      />
    </div>
  );
};
