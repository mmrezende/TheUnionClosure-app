import credentials from './credentials';

import { stringify } from 'query-string';

const getToken = async () => {
  const path = credentials.API_URL + '/api/security/token';

  const username = credentials.API_USERNAME;
  const password = credentials.API_PASSWORD;

  try{
    const response = await fetch(path,{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          username: username,
          password: password
      })
    });
    const token = (await response.json()).token;
    return token;
  }catch(e) {
    console.error(e);
  }
}

const getAvailableDates = async () => {
  const token = await getToken();

  const path = credentials.API_URL + '/api/v1/xFechamentoDatas';
  try{
    const response = await fetch(path,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const availableDates = await response.json();
      return availableDates.map((item: {datas: string}) => (new Date(item.datas)));
    }
  }catch(e) {
    console.error(e);
  }
}

const getOperacionalTotal = async (token: string,date: string) => {
  const path = credentials.API_URL + '/api/v1/xOperacionalTotal';
  const params = {data: date};
  
  const query = path +'?'+ stringify(params);
  try{
    const response = await fetch(query,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const operacionalTotal = await response.json();
      return operacionalTotal;
    }
  }catch(e) {
    console.error(e);
  }
}

const getOperacionalReceita = async (token: string,date: string) => {
  const path = credentials.API_URL + '/api/v1/xOperacionalReceita';
  const params = {data: date};
  
  const query = path +'?'+ stringify(params);
  try{
    const response = await fetch(query,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const operacionalReceita = await response.json();
      return operacionalReceita;
    }
  }catch(e) {
    console.error(e);
  }
}

const getOperacionalDespesas = async (token: string,date: string) => {
  const path = credentials.API_URL + '/api/v1/xOperacionalDespesas';
  const params = {data: date};
  
  const query = path +'?'+ stringify(params);
  try{
    const response = await fetch(query,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const operacionalDespesas = await response.json();
      return operacionalDespesas;
    }
  }catch(e) {
    console.error(e);
  }
}

const getOperacionalDespesasClube = async (token: string,date: string) => {
  const path = credentials.API_URL + '/api/v1/xOperacionalDespesasClube';
  const params = {data: date};
  
  const query = path +'?'+ stringify(params);
  try{
    const response = await fetch(query,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const operacionalDespesasClube = await response.json();
      return operacionalDespesasClube;
    }
  }catch(e) {
    console.error(e);
  }
};

const getRakeTotal = async (token: string,date: string) => {
  const path = credentials.API_URL + '/api/v1/xRakeTotal';
  const params = {data: date};
  
  const query = path +'?'+ stringify(params);
  try{
    const response = await fetch(query,{
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if(response.status===200){
      const rakeTotal = (await response.json())[0].xrake_total;
      return rakeTotal;
    }
  }catch(e) {
    console.error(e);
  }
};

const formatCurrency = (value: string) => {
  const converted = Number(value);
  if (converted === 0) return '-';

  return (converted.toFixed(2).toString().replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
}

const formatPercentage = (value: string) => {
  const converted = Number(value);
  return ((converted.toFixed(2) + '%')).replace('.',',');
}

const getData = async (date:string) => {
  const token = await getToken();
  // console.log((await getAvailableDates(token))[0].toLocaleString());

  const operacionalTotal = await getOperacionalTotal(token, date);
  const operacionalReceita = await getOperacionalReceita(token, date);
  const operacionalDespesas = await getOperacionalDespesas(token, date);
  const operacionalDespesasClube = await getOperacionalDespesasClube(token, date);
  const rakeTotal = await getRakeTotal(token,date);

  let clubs = operacionalDespesasClube.map((item: any) => item.clube)
    .filter((value:number, index:number, self:any) => self.indexOf(value) === index);

  const data = {
    bigCards: [
      {
        title: 'Total', sources:[
          {description: operacionalTotal[0].descritivo, value: formatCurrency(operacionalTotal[0].valor), percentage: ""},
          {description: operacionalTotal[1].descritivo, value: formatCurrency(operacionalTotal[1].valor), percentage: ""}
        ],
        total: {description: "", value: formatCurrency(operacionalTotal[2].valor), percentage: formatPercentage(operacionalTotal[3].valor)}
      },
      {
        title: 'Receita', sources: (
          operacionalReceita.map((obj: any) => {
            return {description: obj.clube, value: formatCurrency(obj.rake), percentage: ""}
          })
        ),
        total: {description: '', value: formatCurrency(operacionalTotal[0].valor), percentage: ''}
      },
      {
        title: 'Despesas', sources: (
          operacionalDespesas.map((obj: any) => {
            return {
              description: obj.clube,
              value: formatCurrency(obj.rake),
              percentage: formatPercentage((Number(obj.rake)/rakeTotal * 100).toString())
            }
          })
        ),
        total: {
          description: '',
          value: formatCurrency(operacionalTotal[1].valor),
          percentage: formatPercentage((Number(
            operacionalDespesas.map((item: any) => item.rake)
              .reduce((prev: any, next: any) => Number(prev) + Number(next))
          )/rakeTotal * 100).toString())
        }
      }
    ],
    smallCards: ( 
      clubs.map((club: any) => {
        return {
          title: 'Despesas '+ club,
          sources: (operacionalDespesasClube.filter((item:any) => item.clube === club)
            .map((item: any) => {
              return {description: item.descricao, value: formatCurrency(item.valor)};
            })
          ),
          total: '0'
        }
      })
    ).concat(
      [{
        title: 'Despesas The Union Resumo',
        sources: []
      }]
    )
  }

  // console.log("\n\nBig cards: "+JSON.stringify(data.bigCards));
  // console.log("\n\nSmall cards: "+JSON.stringify(data.smallCards));
  // console.log(expenses);
  // console.log(expenses.map((item: any) => item.rake)
  // .reduce((prev: any, next: any) => Number(prev) + Number(next)));
  return data;
};

export {getData, getAvailableDates};