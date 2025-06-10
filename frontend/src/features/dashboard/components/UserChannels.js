import TitleCard from "../../../components/Cards/TitleCard"

const userSourceData = [
    {source : "Real Estate", conversionPercent : 25.2},
    {source : "Stock Market", conversionPercent : 21.1},
    {source : "Cryptocurrencies", conversionPercent : 20.3},

    {source : "Exchange-Traded Funds", conversionPercent : 12.4},
    {source : "Commodities", conversionPercent : 10.7},
    {source : "Venture Capital", conversionPercent : 10.3},

]

function UserChannels(){
    return(
        <TitleCard title={"Investment Fields"}>
             {/** Table Data */}
             <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th></th>
                        <th className="normal-case">Source</th>
                        <th className="normal-case">Conversion</th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            userSourceData.map((u, k) => {
                                return(
                                    <tr key={k}>
                                        <th>{k+1}</th>
                                        <td>{u.source}</td>
                                        <td>{`${u.conversionPercent}%`}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </TitleCard>
    )
}

export default UserChannels
