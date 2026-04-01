import { useAppStore } from '../../app/store'
import type { ImportedDataset } from '../../lib/models'
import FileImportPanel from '../common/FileImportPanel'
import ScreenshotModeToggle from '../common/ScreenshotModeToggle'
import DetailsView from '../details/DetailsView'
import OverviewView from '../overview/OverviewView'
import SummaryView from '../summary/SummaryView'
import PatientHeader from './PatientHeader'
import TopTabs from './TopTabs'

interface AppShellProps {
  initialDataset?: ImportedDataset
}

export default function AppShell({ initialDataset }: AppShellProps) {
  const activeTab = useAppStore((state) => state.activeTab)
  const setActiveTab = useAppStore((state) => state.setActiveTab)
  const dataset = useAppStore((state) => state.dataset) ?? initialDataset
  const setDataset = useAppStore((state) => state.setDataset)
  const screenshotMode = useAppStore((state) => state.screenshotMode)
  const setScreenshotMode = useAppStore((state) => state.setScreenshotMode)

  return (
    <main className={screenshotMode ? 'app-shell is-screenshot' : 'app-shell'}>
      <div className="app-frame">
        <PatientHeader dataset={dataset} />
        <TopTabs activeTab={activeTab} onChange={setActiveTab} />
        <section className="shell-toolbar">
          <FileImportPanel onImported={setDataset} dataset={dataset} />
          <ScreenshotModeToggle checked={screenshotMode} onChange={setScreenshotMode} />
        </section>
        {activeTab === 'overview' ? <OverviewView /> : null}
        {activeTab === 'details' ? <DetailsView /> : null}
        {activeTab === 'summary' ? <SummaryView /> : null}
      </div>
    </main>
  )
}
