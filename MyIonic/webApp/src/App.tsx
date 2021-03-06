import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ItemEdit, ItemList } from './components';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { NoteProvider } from './components/NoteProvider';
import { animationBuilder } from './components/AnimationBuilder';

const App: React.FC = () => (
  <IonApp>
    <NoteProvider>
      <IonReactRouter>
        <IonRouterOutlet animation={animationBuilder}>
          <Route path="/notes" component={ItemList} exact={true} />
          <Route path="/note" component={ItemEdit} exact={true} />
          <Route path="/note/:id" component={ItemEdit} exact={true} />
          <Route exact path="/" render={() => <Redirect to="/notes" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </NoteProvider>
  </IonApp>
);

export default App;
