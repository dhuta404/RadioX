import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  extra?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, extra }: Props) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {extra ? <div>{extra}</div> : null}
    </div>
  );
}
