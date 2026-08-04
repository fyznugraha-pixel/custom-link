import { headers } from 'next/headers';
import UnlockClient from './UnlockClient';

export default function UnlockPage({ 
  params 
}: { 
  params: { code: string }
}) {
  const headersList = headers();
  
  const domain = headersList.get('x-domain') || '';
  const unlockAtParam = headersList.get('x-unlock-at');
  const hasPasswordParam = headersList.get('x-has-password') === 'true';
  const titleParam = headersList.get('x-title');

  return (
    <UnlockClient
      code={params.code}
      domain={domain}
      unlockAtParam={unlockAtParam}
      hasPasswordParam={hasPasswordParam}
      titleParam={titleParam}
    />
  );
}
