import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function LineChart() {

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Define the labels
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  // Define a fixed set of increasing values
  const fixedData = [510, 525, 535, 560, 580, 600, 640]; // Static, increasing values

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'MAU',
        data: fixedData, // Use the fixed set of increasing values
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <TitleCard title={"Monthly Active Users (in K)"}>
      <Line data={data} options={options} />
    </TitleCard>
  );
}

export default LineChart;
