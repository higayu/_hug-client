import { useCallback, useState } from 'react'
import ChildKadaiTable from './ChildKadaiTable'
import ScoreChartPage from './ChildKadaiTable/graph/ScoreChartPage'

export default function ChildKadai() {
  const [target, setTarget] = useState(null)
  const back = useCallback(() => setTarget(null), [])

  return target
    ? <ScoreChartPage {...target} onBack={back} />
    : <ChildKadaiTable onShowGraph={setTarget} />
}

export { ChildKadaiTable }
