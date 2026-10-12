import { BrowserRouter, Route, Routes } from 'react-router'
import { HomePage } from './pages/home-page'
import { NotFoundPage } from './pages/not-found-page'
import { RedirectPage } from './pages/redirect-page'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:shortUrl" element={<RedirectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
