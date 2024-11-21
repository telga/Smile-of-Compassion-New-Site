import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_DONATIONS } from '../queries/projectQueries';
import { Table, Button, Spin, Alert } from 'antd';
import * as XLSX from 'xlsx';

function DonationsDataTable() {
  const { loading, error, data } = useQuery(GET_ALL_DONATIONS);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Donation Amount', dataIndex: 'donationAmount', key: 'donationAmount' },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Full Address', dataIndex: 'fullAddress', key: 'fullAddress' },
  ];

  const exportToDonationsExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.donationAmounts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, 'donations_data.xlsx');
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error.message} />;

  return (
    <div>
      <Button 
        type="primary" 
        onClick={exportToDonationsExcel}
        style={{ marginBottom: '1rem' }}
      >
        Export to Excel
      </Button>
      <Table 
        columns={columns} 
        dataSource={data.donationAmounts} 
        rowKey="id"
        scroll={{ x: true }}
      />
    </div>
  );
}

export default DonationsDataTable; 