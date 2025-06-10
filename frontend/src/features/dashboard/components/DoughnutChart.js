import {
    Chart as ChartJS,
    Filler,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

// Registering components needed for ChartJS
ChartJS.register(ArcElement, Tooltip, Legend, Filler);

function DoughnutChart() {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {

                        // Return only the color of the segment
                        return null;
                    },
                },
            },
        },
    };

    const labels = ['INDIA', 'UAE', 'SINGAPORE', 'UK', 'US', 'GERMANY'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Investment',
                data: [30, 20, 12, 17, 15, 7],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            }
        ],
    };

    return (
        <></>
    );
}

export default DoughnutChart;
