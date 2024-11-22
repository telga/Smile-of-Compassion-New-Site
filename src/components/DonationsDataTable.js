import React from 'react';
import { useQuery, ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GET_ALL_DONATIONS } from '../queries/projectQueries';
import { Table, Button, Spin, Alert } from 'antd';
import * as XLSX from 'xlsx';
import { ReloadOutlined } from '@ant-design/icons';

// Create a separate Apollo Client for donations
const donationsClient = new ApolloClient({
  uri: process.env.REACT_APP_DONATION_HYGRAPH_API_URL,
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_DONATION_HYGRAPH_AUTH_TOKEN}`
  }
});

function DonationsDataTable() {
  return (
    <ApolloProvider client={donationsClient}>
      <DonationsTable />
    </ApolloProvider>
  );
}

function DonationsTable() {
  const { loading, error, data, refetch } = useQuery(GET_ALL_DONATIONS, {
    fetchPolicy: 'network-only' // This ensures fresh data on component mount
  });

  const columns = [
    { 
      title: 'Donation Amount', 
      dataIndex: 'donationAmount', 
      key: 'donationAmount',
      render: (amount) => amount.toFixed(2)
    },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Full Address', dataIndex: 'fullAddress', key: 'fullAddress' },
  ];

  const exportToDonationsExcel = () => {
    const exportData = data.donations.map(({ id, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, `donations_data_${today}.xlsx`);
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error.message} />;

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <Button 
          type="primary" 
          onClick={exportToDonationsExcel}
        >
          Export to Excel
        </Button>
        <Button 
          onClick={() => refetch()}
          icon={<ReloadOutlined />}
        >
          Refresh
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={[...data.donations].reverse()}
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
}

export default DonationsDataTable; 