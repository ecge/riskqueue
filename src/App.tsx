import { useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  MantineProvider,
  Paper,
  Progress,
  RingProgress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Timeline,
  Title,
} from '@mantine/core'
import { BarChart } from '@mantine/charts'
import {
  IconAlertTriangle,
  IconChecklist,
  IconCreditCard,
  IconSearch,
  IconShieldCheck,
  IconShieldX,
} from '@tabler/icons-react'
import '@mantine/core/styles.css'
import '@mantine/charts/styles.css'
import './App.css'

type ReviewStatus = 'New' | 'Escalated' | 'Approved' | 'Blocked'

type Transaction = {
  id: string
  merchant: string
  customer: string
  amount: number
  location: string
  device: string
  score: number
  status: ReviewStatus
  reasons: string[]
}

const seedTransactions: Transaction[] = [
  {
    id: 'TX-88421',
    merchant: 'Cobalt Gadgets',
    customer: 'Leah M.',
    amount: 1840,
    location: 'Berlin, DE',
    device: 'New Android device',
    score: 91,
    status: 'Escalated',
    reasons: ['First purchase over threshold', 'Device changed this session', 'Card velocity spike'],
  },
  {
    id: 'TX-88422',
    merchant: 'North Pier Books',
    customer: 'Omar K.',
    amount: 78,
    location: 'Boston, US',
    device: 'Known iPhone',
    score: 18,
    status: 'Approved',
    reasons: ['Known device', 'Low value order', 'Normal buying pattern'],
  },
  {
    id: 'TX-88423',
    merchant: 'Vector Travel',
    customer: 'Mina S.',
    amount: 2320,
    location: 'Lima, PE',
    device: 'Unrecognized browser',
    score: 84,
    status: 'New',
    reasons: ['Geo jump under two hours', 'High value travel spend', 'No saved device match'],
  },
  {
    id: 'TX-88424',
    merchant: 'Metro Parts',
    customer: 'Sam R.',
    amount: 460,
    location: 'Austin, US',
    device: 'Known desktop',
    score: 66,
    status: 'New',
    reasons: ['Unusual category', 'Billing address recently changed', 'Medium value order'],
  },
]

const filters = ['All', 'New', 'Escalated', 'Approved', 'Blocked'] as const
type Filter = (typeof filters)[number]

const currency = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
})

function badgeColor(status: ReviewStatus) {
  if (status === 'Approved') return 'green'
  if (status === 'Blocked') return 'red'
  if (status === 'Escalated') return 'yellow'
  return 'blue'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Severe'
  if (score >= 65) return 'Elevated'
  if (score >= 35) return 'Watch'
  return 'Low'
}

function App() {
  const [transactions, setTransactions] = useState(seedTransactions)
  const [selectedId, setSelectedId] = useState(seedTransactions[0].id)
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const selected =
    transactions.find((transaction) => transaction.id === selectedId) ?? transactions[0]

  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return transactions.filter((transaction) => {
      const matchesFilter = filter === 'All' || transaction.status === filter
      const matchesSearch =
        !query ||
        [
          transaction.id,
          transaction.merchant,
          transaction.customer,
          transaction.location,
          transaction.device,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)

      return matchesFilter && matchesSearch
    })
  }, [filter, search, transactions])

  const queueCount = transactions.filter(
    (transaction) => transaction.status === 'New' || transaction.status === 'Escalated',
  ).length
  const blockedValue = transactions
    .filter((transaction) => transaction.status === 'Blocked')
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const averageScore = Math.round(
    transactions.reduce((sum, transaction) => sum + transaction.score, 0) /
      transactions.length,
  )

  const chartData = transactions.map((transaction) => ({
    id: transaction.id.replace('TX-', ''),
    score: transaction.score,
  }))

  function updateSelected(status: ReviewStatus) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === selected.id ? { ...transaction, status } : transaction,
      ),
    )
  }

  return (
    <MantineProvider defaultColorScheme="dark">
      <main className="riskqueue-app">
        <Container size="xl" py="xl">
          <Group justify="space-between" align="flex-start" mb="xl">
            <div>
              <Text c="red.3" fw={700} tt="uppercase" size="sm">
                Mantine risk console
              </Text>
              <Title order={1}>RiskQueue</Title>
              <Text c="dimmed">Fraud review desk with model scores and analyst decisions.</Text>
            </div>
            <Group>
              <Button variant="default" leftSection={<IconCreditCard size={16} />}>
                Import batch
              </Button>
              <Button color="red" leftSection={<IconChecklist size={16} />}>
                Review queue
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Open reviews
              </Text>
              <Title order={2}>{queueCount}</Title>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Average risk score
              </Text>
              <Title order={2}>{averageScore}</Title>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Blocked value
              </Text>
              <Title order={2}>{currency.format(blockedValue)}</Title>
            </Card>
            <Card withBorder>
              <Text c="dimmed" size="sm">
                Median review time
              </Text>
              <Title order={2}>4.2m</Title>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
            <Paper withBorder p="md" radius="md" className="riskqueue-table-card">
              <Group justify="space-between" mb="md">
                <div>
                  <Title order={3}>Transaction queue</Title>
                  <Text c="dimmed" size="sm">
                    Search, filter, and open analyst decisions.
                  </Text>
                </div>
                <SegmentedControl
                  className="riskqueue-filter"
                  size="xs"
                  value={filter}
                  data={[...filters]}
                  onChange={(value) => setFilter(value as Filter)}
                />
              </Group>
              <TextInput
                leftSection={<IconSearch size={16} />}
                mb="md"
                placeholder="Search transactions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Table.ScrollContainer minWidth={760}>
                <Table striped highlightOnHover verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Transaction</Table.Th>
                      <Table.Th>Customer</Table.Th>
                      <Table.Th>Location</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Score</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {visibleTransactions.map((transaction) => (
                      <Table.Tr key={transaction.id} onClick={() => setSelectedId(transaction.id)}>
                        <Table.Td>
                          <Text fw={700}>{transaction.id}</Text>
                          <Text c="dimmed" size="sm">
                            {transaction.merchant}
                          </Text>
                        </Table.Td>
                        <Table.Td>{transaction.customer}</Table.Td>
                        <Table.Td>{transaction.location}</Table.Td>
                        <Table.Td>{currency.format(transaction.amount)}</Table.Td>
                        <Table.Td>{transaction.score}</Table.Td>
                        <Table.Td>
                          <Badge color={badgeColor(transaction.status)}>{transaction.status}</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Paper>

            <Stack>
              <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                  <div>
                    <Title order={3}>{selected.id}</Title>
                    <Text c="dimmed">{selected.merchant}</Text>
                  </div>
                  <Badge color={badgeColor(selected.status)}>{selected.status}</Badge>
                </Group>
                <Group justify="center">
                  <RingProgress
                    size={180}
                    thickness={16}
                    sections={[{ value: selected.score, color: selected.score >= 85 ? 'red' : 'yellow' }]}
                    label={
                      <Text ta="center" fw={700} size="xl">
                        {selected.score}
                      </Text>
                    }
                  />
                </Group>
                <Text ta="center" fw={700}>
                  {scoreLabel(selected.score)} risk
                </Text>
                <Progress value={selected.score} color={selected.score >= 85 ? 'red' : 'yellow'} mt="md" />
                <Group grow mt="md">
                  <Button color="green" onClick={() => updateSelected('Approved')}>
                    Approve
                  </Button>
                  <Button color="red" onClick={() => updateSelected('Blocked')}>
                    Block
                  </Button>
                </Group>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Title order={3} mb="md">
                  Model factors
                </Title>
                <Timeline active={selected.reasons.length} bulletSize={24} lineWidth={2}>
                  {selected.reasons.map((reason) => (
                    <Timeline.Item
                      bullet={
                        <ThemeIcon color="red" radius="xl" size={24}>
                          <IconAlertTriangle size={14} />
                        </ThemeIcon>
                      }
                      key={reason}
                      title={reason}
                    >
                      <Text c="dimmed" size="sm">
                        {selected.customer} · {selected.device}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Paper>

              <Alert color="red" icon={<IconShieldX size={18} />} variant="light">
                Analysts can approve, block, or escalate the selected transaction.
              </Alert>
            </Stack>

            <Paper withBorder p="md" radius="md">
              <Group mb="md">
                <ThemeIcon color="red" size="lg">
                  <IconShieldCheck size={18} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Score distribution</Title>
                  <Text c="dimmed" size="sm">
                    Mantine chart component
                  </Text>
                </div>
              </Group>
              <BarChart
                h={300}
                data={chartData}
                dataKey="id"
                series={[{ name: 'score', color: 'red.6' }]}
                tickLine="y"
              />
            </Paper>
          </SimpleGrid>
        </Container>
      </main>
    </MantineProvider>
  )
}

export default App
