import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import css from './styles.module.css'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Title, Tooltip)

// Types

interface MemberRecord {
  id: string
  jdNumber: string
  name: string
  licenseType: string
  employer: string
  location: string
  emailDomain: string
  lawSchool: string
  barAdmissionYear: string
}

type ChartType = 'bar' | 'horizontalBar' | 'doughnut' | 'line' | 'stackedBar' | 'lawSchoolsByYear'

// Utility functions

const countOccurrences = <T extends keyof MemberRecord>(data: MemberRecord[], key: T): Record<string, number> =>
  data.reduce((acc, record) => {
    const value = record[key] || 'Unknown'

    acc[value] = (acc[value] || 0) + 1

    return acc
  }, {} as Record<string, number>)

const sortObjectByValue = (obj: Record<string, number>): [string, number][] =>
  Object.entries(obj).sort(([, a], [, b]) => b - a)

// Chart data functions

const getLicenseTypeData = (data: MemberRecord[]): ChartData<'bar'> => {
  const counts = countOccurrences(data, 'licenseType')
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Number of Members',
        data: Object.values(counts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  }
}

const getLocationData = (data: MemberRecord[]): ChartData<'doughnut'> => {
  const counts = countOccurrences(data, 'location')
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        data: Object.values(counts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)'
        ],
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ]
      }
    ]
  }
}

const getLawSchoolData = (data: MemberRecord[]): ChartData<'bar'> => {
  const filteredData = data.filter(record => record.lawSchool && record.lawSchool !== 'Unknown')
  const counts = countOccurrences(filteredData, 'lawSchool')
  const sortedSchools = sortObjectByValue(counts).slice(0, 10)

  return {
    labels: sortedSchools.map(([school]) => school),
    datasets: [
      {
        label: 'Number of Graduates',
        data: sortedSchools.map(([, count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }
    ]
  }
}

const getBarAdmissionYearData = (data: MemberRecord[]): ChartData<'line'> => {
  const filteredData = data.filter(record => record.barAdmissionYear && record.barAdmissionYear !== 'Unknown')
  const counts = countOccurrences(filteredData, 'barAdmissionYear')
  const sortedYears = Object.keys(counts).sort()

  return {
    labels: sortedYears,
    datasets: [
      {
        label: 'Number of Admissions per Year',
        data: sortedYears.map(year => counts[year]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }
}

const getLicenseStatusByYearData = (data: MemberRecord[]): ChartData<'bar'> => {
  const yearLicenseCounts: Record<string, Record<string, number>> = {}
  data.forEach(record => {
    if (record.barAdmissionYear && record.licenseType) {
      if (!yearLicenseCounts[record.barAdmissionYear]) {
        yearLicenseCounts[record.barAdmissionYear] = {}
      }
      yearLicenseCounts[record.barAdmissionYear][record.licenseType] =
        (yearLicenseCounts[record.barAdmissionYear][record.licenseType] || 0) + 1
    }
  })

  const years = Object.keys(yearLicenseCounts).sort()
  const licenseTypes = new Set<string>()
  years.forEach(year => Object.keys(yearLicenseCounts[year]).forEach(type => licenseTypes.add(type)))

  return {
    labels: years,
    datasets: Array.from(licenseTypes).map(type => ({
      label: type,
      data: years.map(year => yearLicenseCounts[year][type] || 0),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, 0.6)`,
      stack: 'Stack 0'
    }))
  }
}

const getLawSchoolsByYearData = (data: MemberRecord[]): ChartData<'bar'> => {
  const yearSchoolCounts: Record<string, Record<string, number>> = {}

  data.forEach(record => {
    if (record.barAdmissionYear && record.barAdmissionYear !== 'Unknown' && record.lawSchool) {
      if (!yearSchoolCounts[record.barAdmissionYear]) {
        yearSchoolCounts[record.barAdmissionYear] = {}
      }
      yearSchoolCounts[record.barAdmissionYear][record.lawSchool] =
        (yearSchoolCounts[record.barAdmissionYear][record.lawSchool] || 0) + 1
    }
  })

  const years = Object.keys(yearSchoolCounts).sort()
  const allSchools = new Set<string>()
  years.forEach(year => Object.keys(yearSchoolCounts[year]).forEach(school => allSchools.add(school)))

  const topSchools = Array.from(allSchools)
    .sort(
      (a, b) =>
        years.reduce((sum, year) => sum + (yearSchoolCounts[year][b] || 0), 0) -
        years.reduce((sum, year) => sum + (yearSchoolCounts[year][a] || 0), 0)
    )
    .slice(0, 1)

  const datasets = topSchools.map(school => ({
    label: school,
    data: years.map(year => yearSchoolCounts[year][school] || 0),
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, 0.6)`
  }))

  // Add "Other" category
  const otherData = years.map(year => {
    const totalForYear = Object.values(yearSchoolCounts[year]).reduce((sum, count) => sum + count, 0)
    const topSchoolsForYear = topSchools.reduce((sum, school) => sum + (yearSchoolCounts[year][school] || 0), 0)
    return totalForYear - topSchoolsForYear
  })

  datasets.push({
    label: 'Other',
    data: otherData,
    backgroundColor: 'rgba(200, 200, 200, 0.6)' // Gray color for "Other"
  })

  return {
    labels: years,
    datasets: datasets
  }
}

// Chart options

const getBarChartOptions = (title: string, isHorizontal: boolean = false): ChartOptions<'bar'> => ({
  maintainAspectRatio: false,
  indexAxis: isHorizontal ? ('y' as const) : ('x' as const),
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: title }
  },
  scales: {
    x: { beginAtZero: true },
    y: { beginAtZero: true }
  }
})

const getDoughnutChartOptions = (title: string): ChartOptions<'doughnut'> => ({
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: title }
  }
})

const getLineChartOptions = (title: string): ChartOptions<'line'> => ({
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: title }
  },
  scales: {
    y: { beginAtZero: true }
  }
})

const getStackedBarChartOptions = (title: string): ChartOptions<'bar'> => ({
  ...getBarChartOptions(title),
  scales: {
    x: { stacked: true },
    y: { stacked: true }
  }
})

// Main component

const MemberChart: React.FC = () => {
  const [data, setData] = useState<MemberRecord[]>([])
  const [chartType, setChartType] = useState<ChartType>('bar')

  useEffect(() => {
    fetch('/processed-member-records.csv')
      .then(response => response.text())
      .then(csvString => {
        const { data } = Papa.parse<MemberRecord>(csvString, { header: true })
        setData(data)
      })
  }, [])

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar options={getBarChartOptions('Member License Types')} data={getLicenseTypeData(data)} />
      case 'horizontalBar':
        return <Bar options={getBarChartOptions('Top 10 Law Schools', true)} data={getLawSchoolData(data)} />
      case 'doughnut':
        return (
          <Doughnut
            options={getDoughnutChartOptions('Geographical Distribution of Members')}
            data={getLocationData(data)}
          />
        )
      case 'line':
        return (
          <Line
            options={getLineChartOptions('Trend of Bar Admissions Over Years')}
            data={getBarAdmissionYearData(data)}
          />
        )
      case 'stackedBar':
        return (
          <Bar
            options={getStackedBarChartOptions('License Status by Bar Admission Year')}
            data={getLicenseStatusByYearData(data)}
          />
        )
      case 'lawSchoolsByYear':
        return (
          <Bar
            options={getStackedBarChartOptions('Top 10 Law Schools Distribution by Bar Admission Year')}
            data={getLawSchoolsByYearData(data)}
          />
        )
    }
  }

  if (data.length === 0) return <div>Loading...</div>

  return (
    <div className={css.chartContainer}>
      <select value={chartType} onChange={e => setChartType(e.target.value as ChartType)}>
        <option value="bar">License Types (Bar Chart)</option>
        <option value="horizontalBar">Top 10 Law Schools</option>
        <option value="doughnut">Geographical Distribution</option>
        <option value="line">Bar Admission Year Trend</option>
        <option value="stackedBar">License Status by Year</option>
        <option value="lawSchoolsByYear">Law Schools Distribution by Year</option>
      </select>
      {renderChart()}
    </div>
  )
}

export default MemberChart
