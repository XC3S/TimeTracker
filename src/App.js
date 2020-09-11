import React from 'react';
import './App.css';

import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn, AmplifyConfirmSignUp, AmplifySignOut } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

import AppWrapper from './AppWrapper.js'


const App = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
      return onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });
  }, []);

  
return authState === AuthState.SignedIn && user ? (
    <div className="App">
        <AmplifySignOut />
        <AppWrapper user={user}/>
    </div>
  ) : (
    <AmplifyAuthenticator>
      <AmplifySignIn
        slot="sign-in"
        formFields={[
          { type: "username" },
          { type: "password" }
        ]}
      />
      <AmplifySignUp
        slot="sign-up"
        formFields={[
          { type: "username" },
          { type: "email" },
          { type: "password" }
        ]}
      />
      <AmplifyConfirmSignUp
        slot="confirm-sign-up"
        formFields={[
          {
            type: 'email',
            label: 'Email',
            placeholder: 'Type your email',
            required: true,
          },{
            type: 'code',
            label: 'Code',
            placeholder: 'Type the confirmation code',
            required: true,
          },
          {
            type: 'password',
            label: 'Password',
            placeholder: 'Type your password',
            required: true,
          },
      ]}
    />
    </AmplifyAuthenticator>

    
);
}

export default App;
