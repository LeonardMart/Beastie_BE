const searchToQuery = ({ param, columns }) => {
    const queryArr = columns.map(a => ` LOWER(${a}) like '%'|| LOWER(${param}) ||'%' `);
    return `( ${queryArr.join(' OR ')} OR ${param} = '' )`;
  };
  
  
  module.exports = searchToQuery;