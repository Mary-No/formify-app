import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import {Provider} from "react-redux";
import {store} from "./app/store.ts";
import './i18n'
import NProgress from 'nprogress'
import 'antd/dist/reset.css';
import 'nprogress/nprogress.css'
import './styles/global.scss'
import { ThemeProvider } from './components/ThemeProvider.tsx';

NProgress.configure({
    showSpinner: false,
    speed: 400,
    minimum: 0.2,
})

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
      <ThemeProvider>
              <App />
      </ThemeProvider>
  </Provider>,
)
