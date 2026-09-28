import { gql } from '@apollo/client';

/* Mirrors backend-tredella's auth surface. `requireRole: ADMIN` is what stops a
   buyer or seller account signing into this console — the backend rejects the
   sign-in outright rather than handing out a token we would then have to
   second-guess on the client.

   There is deliberately no register or password-reset document here: admin
   accounts are created by an existing super admin, not self-served. */

export const LOGIN_ADMIN = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    login(email: $email, password: $password, requireRole: ADMIN) {
      token
      user {
        id
        name
        email
        role
        avatar
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatar
    }
  }
`;

/* The one settings action the API can already do. There is no profile
   mutation — no updateProfile, no updateMe — so the Profile tab has nowhere
   to save a name or an avatar yet. */
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;
