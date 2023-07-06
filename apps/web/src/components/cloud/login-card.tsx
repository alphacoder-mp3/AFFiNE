import { UserAvatar } from '@affine/component/user-avatar';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { CloudWorkspaceIcon } from '@blocksuite/icons';
import { signIn } from 'next-auth/react';

import { useCurrenLoginStatus } from '../../hooks/affine/use-curren-login-status';
import { useCurrentUser } from '../../hooks/affine/use-current-user';
import { StyledSignInButton } from '../pure/footer/styles';

export const LoginCard = () => {
  const t = useAFFiNEI18N();
  const loginStatus = useCurrenLoginStatus();
  if (loginStatus === 'authenticated') {
    return <UserCard />;
  }
  return (
    <StyledSignInButton
      data-testid="sign-in-button"
      noBorder
      bold
      icon={
        <div className="circle">
          <CloudWorkspaceIcon />
        </div>
      }
      onClick={async () => {
        // jump to login page
        signIn().catch(console.error);
      }}
    >
      {t['Sign in']()}
    </StyledSignInButton>
  );
};

const UserCard = () => {
  const user = useCurrentUser();
  return (
    <div>
      <UserAvatar
        size={28}
        name={user.name}
        url={user.image}
        className="avatar"
      />
      <div>{user.name}</div>
      <div>{user.email}</div>
    </div>
  );
};