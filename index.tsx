import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import { defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { QueryDevtoolsPanel } from './components/dev/QueryDevtoolsPanel';
import { SERVER_GC_TIME_MS } from './lib/supabase/query-config';
import { queryClient } from './lib/query-client';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && typeof sentryDsn === 'string' && sentryDsn.trim() !== '') {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'production',
    enabled: true,
  });
}

// PWA: đăng ký SW + toast cập nhật/offline trong App (PwaRegister)

/**
 * Persist React Query cache to localStorage so page reloads within the gcTime
 * window (30 min) restore data instantly without re-fetching from Supabase.
 * buster is incremented whenever the cache schema changes to avoid stale shapes.
 * v2: invalidate persisted RQ sau khi thêm cột / shape danh sách chức vụ (vd. cap_quan_ly).
 * v3: danh sách nhân viên thêm `don_vi_id` / `ten_don_vi`.
 * v4: không persist `['employees','list',…]` và `['employee', id]` — tránh danh sách/chi tiết
 *     cũ sau khi bản ghi đã xóa khỏi DB (reload vẫn thấy nhân viên “ảo”).
 * v6: drop modules MTTQ / viết bài / giao việc — bump buster invalidate cache cũ.
 * v7: bỏ cột `cap_quan_ly` khỏi chức vụ / nhân viên.
 */
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'erp-rq-cache',
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: localStoragePersister,
            maxAge: SERVER_GC_TIME_MS,
            buster: '7',
            dehydrateOptions: {
              shouldDehydrateQuery: (query) => {
                const k = query.queryKey;
                if (!Array.isArray(k)) return defaultShouldDehydrateQuery(query);
                if (k[0] === 'employees' && k[1] === 'list') return false;
                if (k[0] === 'employee') return false;
                return defaultShouldDehydrateQuery(query);
              },
            },
          }}
        >
          <App />
          <QueryDevtoolsPanel />
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </Router>
  </React.StrictMode>
);
