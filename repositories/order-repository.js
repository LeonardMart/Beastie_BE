const db = require("../config/db.config");
const moment = require("moment");
const searchToQuery = require("../utils/search-to-query");

const dateNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
};

const retrieveUser = async ({ email, pass }) => {
  const sql = `
SELECT  
  ul.user_id as userId,
  ul.username,
  ul.email,
  ul.phone_num as phone,
  ad.userAddress,
  pl.pets,
  ul.pf_flag
FROM USER_LIST ul
LEFT JOIN (
  SELECT 
      user_id,
      json_agg(json_build_object(
          'id', id,
          'label', label,
          'detailAddress', detail_address,
          'latitude', location_lat,
          'longitude', location_long
      )) as userAddress
  FROM user_address
  GROUP BY user_id
) ad ON ul.user_id = ad.user_id
LEFT JOIN (
  SELECT 
      user_id,
      json_agg(json_build_object(
         'id', pet_id,
          'name', name,
          'gender', gender,
          'dob', birth_date,
          'breed', breed,
          'type', pt.type_name
      )) as pets
  FROM pet_list pl
  LEFT JOIN pet_type pt ON pl.type = pt.type_id
  GROUP BY user_id
) pl ON ul.user_id = pl.user_id
WHERE LOWER(ul.email) = LOWER($1) AND ul.password = $2; `;
  const param = [email, pass];
  const result = await db.query(sql, param);
  return result.rows;
};

const getPf = async ({ userId, searchKeyword }) => {
  let whereQuery =
    " AND " +
    searchToQuery({
      param: "$2",
      columns: ["username"],
    });
  console.log("user", userId);
  const sql = `
        with filtered_user as (
            select
                user_id,
                username,
                pf_flag
            from user_list
            where user_id != $1
            ${whereQuery}
        ),
        pf_user as (
            select 
                fu.user_id,
                fu.username,
                pf.price_hourly,
                pf.price_daily
            from filtered_user fu
            left join pet_friend pf on pf.user_id = fu.user_id
            where fu.pf_flag = true 
              and pf.is_order = false 
              and pf.is_active = true
        )
        select 
            pu.*,
            ua.location_lat,
            ua.location_long,
            ua.detail_address,
            ap.accept_dog,
            ap.accept_cat,
            ap.accept_other,
			round(pfr.avg_rating,1) as avg_rating,
			pfr.review_count
        from pf_user pu
        left join user_address ua on ua.user_id = pu.user_id
        left join accepted_pet ap on ap.user_id = pu.user_id
        left join (
          SELECT
            pf_id,
            AVG(rating) AS avg_rating,
			count(id) as review_count
          FROM reviews
          GROUP BY pf_id
          )pfr on pu.user_id = pfr.pf_id
        where ua.is_pet_friend = true
   
    `;
  const param = [userId, searchKeyword];
  const result = await db.query(sql, param);
  return result.rows;
};

const getPfById = async ({ userId, ownerId }) => {
  console.log("user", userId);
  const sql = `
      WITH filtered_user AS (
            SELECT
                user_id,
                username,
                pf_flag
            FROM user_list
            WHERE user_id = $1
        ),
        pf_user AS (
            SELECT 
                fu.user_id,
                fu.username,
                pf.price_hourly,
                pf.price_daily
            FROM filtered_user fu
            LEFT JOIN pet_friend pf ON pf.user_id = fu.user_id
            WHERE fu.pf_flag = true 
              AND pf.is_order = false 
              AND pf.is_active = true
        )
        SELECT 
            pu.*,
            ua.id AS address_id,
            ua.location_lat,
            ua.location_long,
            ua.detail_address,
            ap.accept_dog,
            ap.accept_cat,
            ap.accept_other,
            ROUND(pfr.avg_rating, 1) AS avg_rating,
            pfr.review_count,
            COALESCE(bm.is_bookmarked, FALSE) AS bookmark
        FROM pf_user pu
        LEFT JOIN user_address ua ON ua.user_id = pu.user_id
        LEFT JOIN accepted_pet ap ON ap.user_id = pu.user_id
        LEFT JOIN (
          SELECT
            pf_id,
            AVG(rating) AS avg_rating,
            COUNT(id) AS review_count
          FROM reviews
          GROUP BY pf_id
        ) pfr ON pu.user_id = pfr.pf_id
        LEFT JOIN (
          SELECT
            pf_id,
            TRUE AS is_bookmarked
          FROM bookmark
          WHERE user_id = $2
        ) bm ON pu.user_id = bm.pf_id
        WHERE ua.is_pet_friend = true;
  `;
  const param = [userId, ownerId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getPfTaskService = async ({ userId }) => {
  const sql = `
    select * from task_service where user_id = $1
  `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getAllPfTaskService = async ({ userId }) => {
  const sql = `
    select * from task_service where user_id = $1
  `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const createOrder =
  (client) =>
  async ({
    userId,
    pfId,
    startDate,
    endDate,
    owner_address_id,
    pf_address_id,
    total_price,
    delivery,
  }) => {
    const sql = `
    insert into orders
    (pet_owner_id, pet_friend_id, start_date, end_date, owner_address_id, price, delivery_id, pf_address_id)
    values($1, $2, $3, $4, $5, $6, $7,$8)
    `;
    const param = [
      userId,
      pfId,
      startDate,
      endDate,
      owner_address_id,
      total_price,
      delivery,
      pf_address_id,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const getOrderId =
  (client) =>
  async ({ userId, pfId, startDate, endDate }) => {
    const sql = `
      select order_id from orders where pet_owner_id = $1
        and pet_friend_id = $2
        and start_date = $3
        and end_date = $4
      `;
    const param = [userId, pfId, startDate, endDate];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertOrderPrice =
  (client) =>
  async ({
    orderId,
    total_days,
    daily_price,
    total_hours,
    hourly_price,
    service_price,
    platform_fee,
  }) => {
    const sql = `
      insert into order_price 
      (order_id, daily_price, hourly_price, service_price, platform_fee, daily_amount, hourly_amount)
      values ($1, $2, $3, $4, $5, $6, $7)
    `;
    const param = [
      orderId,
      daily_price,
      hourly_price,
      service_price,
      platform_fee,
      total_days,
      total_hours,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const retrieveOwnerAddress =
  (client) =>
  async ({ userId, owner_address_id }) => {
    const sql = `
    select * from user_address where user_id = $1 and id = $2`;
    const param = [userId, owner_address_id];
    const result = await client.query(sql, param);
    return result.rows[0];
  };

const retrievePfAddress =
  (client) =>
  async ({ pfId, pf_address_id }) => {
    const sql = `
    select * from user_address where user_id = $1 and id = $2
    `;
    const param = [pfId, pf_address_id];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertOrderAddresses =
  (client) =>
  async ({
    orderId,
    user_id,
    id,
    label,
    detail_address,
    location_lat,
    location_long,
  }) => {
    const sql = `
      insert into order_addresses (order_id, address_id, user_id, label, detail_address, longitude, latitude)
      values($1, $2, $3, $4, $5, $6, $7)
    `;
    const param = [
      orderId,
      id,
      user_id,
      label,
      detail_address,
      location_long,
      location_lat,
    ];
    const result = await client.query(sql, param);
    return result.rows;
  };

const retrievePetbyPetId =
  (client) =>
  async ({ id }) => {
    const sql = `
      select * from pet_list where pet_id = $1
    `;
    const param = [id];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertOrderPet =
  (client) =>
  async ({ orderId, id, userId, name, gender, birth_date, breed, type }) => {
    const sql = `
    insert into order_pets (order_id, pet_id, pet_name, gender, birth_date, breed, type_id, user_id)
    values($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const param = [orderId, id, name, gender, birth_date, breed, type, userId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertOrderTasks =
  (client) =>
  async ({ orderId, task_id, service_name, price, id, count }) => {
    const sql = `
      insert into order_tasks(order_id, task_id, service_name, price, pet_id, amount)
      values($1, $2, $3, $4, $5, $6)
    `;
    const param = [orderId, task_id, service_name, price, id, count];
    const result = await client.query(sql, param);
    return result.rows;
  };

const insertReview = async ({ pfId, userId, rating, description, orderId }) => {
  const sql = `
    insert into reviews (owner_id, pf_id, rating, description, created_date, order_id)
    values($1, $2, $3, $4, $5, $6)
  `;
  const param = [userId, pfId, rating, description, dateNow(), orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getOwnerOrderList = async ({ userId }) => {
  const sql = `
  SELECT
    o.*,
    op.pets,
    oa.address,
    ul.username AS pet_owner,
    ul1.username AS pet_friend,
    opr.*,
    CASE WHEN r.id IS NOT NULL THEN true ELSE false END AS is_reviewed,
    ROUND(pf_review_stats.avg_rating, 2) AS avg_rating,
	  pf_review_stats.review_count
FROM orders o
LEFT JOIN user_list ul ON ul.user_id = o.pet_owner_id
LEFT JOIN user_list ul1 ON ul1.user_id = o.pet_friend_id
LEFT JOIN order_price opr ON opr.order_id = o.order_id
LEFT JOIN reviews r ON r.order_id = o.order_id
LEFT JOIN (
    SELECT
        pf_id,
        AVG(rating) AS avg_rating,
	      count(id) as review_count
    FROM reviews
    GROUP BY pf_id
) pf_review_stats ON o.pet_friend_id = pf_review_stats.pf_id
LEFT JOIN (
    SELECT
        order_id,
        json_agg(json_build_object(
            'pet_id', pet_id,
            'pet_name', pet_name,
            'breed', breed,
            'gender', gender,
            'dob', birth_date,
            'type', pt.type_name,
            'services', (
                SELECT json_agg(
                    json_build_object(
                        'task_id', task_id,
                        'service_name', service_name,
                        'price', price,
                        'count', amount
                    )
                )
                FROM order_tasks ot
                WHERE ot.pet_id = op.pet_id
                  AND ot.order_id = op.order_id
            )
        )) AS pets
    FROM order_pets op
    LEFT JOIN pet_type pt ON op.type_id = pt.type_id
    GROUP BY order_id
) op ON o.order_id = op.order_id
LEFT JOIN (
    SELECT
        order_id,
        json_agg(json_build_object(
            'id', address_id,
            'label', label,
            'detail_address', detail_address,
            'long', longitude,
            'lat', latitude
        )) AS address
    FROM order_addresses oa
    GROUP BY order_id
) oa ON o.order_id = oa.order_id
WHERE o.pet_owner_id = $1
ORDER BY o.order_id DESC;

    `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getPfOrderList = async ({ userId }) => {
  const sql = `
  SELECT
    o.*,
    op.pets,
    oa.address,
    ul.username AS pet_owner,
    ul1.username AS pet_friend,
    opr.*,
    CASE WHEN r.id IS NOT NULL THEN true ELSE false END AS is_reviewed,
    ROUND(pf_review_stats.avg_rating, 2) AS avg_rating,
	  pf_review_stats.review_count
FROM orders o
LEFT JOIN user_list ul ON ul.user_id = o.pet_owner_id
LEFT JOIN user_list ul1 ON ul1.user_id = o.pet_friend_id
LEFT JOIN order_price opr ON opr.order_id = o.order_id
LEFT JOIN reviews r ON r.order_id = o.order_id
LEFT JOIN (
    SELECT
        pf_id,
        AVG(rating) AS avg_rating,
	      count(id) as review_count
    FROM reviews
    GROUP BY pf_id
) pf_review_stats ON o.pet_friend_id = pf_review_stats.pf_id
LEFT JOIN (
    SELECT
        order_id,
        json_agg(json_build_object(
            'pet_id', pet_id,
            'pet_name', pet_name,
            'breed', breed,
            'gender', gender,
            'dob', birth_date,
            'type', pt.type_name,
            'services', (
                SELECT json_agg(
                    json_build_object(
                        'task_id', task_id,
                        'service_name', service_name,
                        'price', price,
                        'count', amount
                    )
                )
                FROM order_tasks ot
                WHERE ot.pet_id = op.pet_id
                  AND ot.order_id = op.order_id
            )
        )) AS pets
    FROM order_pets op
    LEFT JOIN pet_type pt ON op.type_id = pt.type_id
    GROUP BY order_id
) op ON o.order_id = op.order_id
LEFT JOIN (
    SELECT
        order_id,
        json_agg(json_build_object(
            'id', address_id,
            'label', label,
            'detail_address', detail_address,
            'long', longitude,
            'lat', latitude
        )) AS address
    FROM order_addresses oa
    GROUP BY order_id
) oa ON o.order_id = oa.order_id
WHERE o.pet_friend_id = $1
ORDER BY o.order_id DESC;

    `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const convertToUTC = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};

const getAllActiveOrder = async () => {
  const currentDate = convertToUTC(new Date());
  console.log("Current Date:", currentDate.toISOString());

  const sql = `
    SELECT * FROM orders 
    WHERE end_date > $1
      and is_canceled_pf = false
      and is_canceled_owner = false
      and (is_finish_owner = false or is_finish_pf = false)
  `;
  const param = [currentDate.toISOString()];
  const result = await db.query(sql, param);
  return result.rows;
};

const updatePfStatus = async ({ userId }) => {
  const sql = `
    update pet_friend set is_order = false where user_id = $1
  `;
  const param = [userId];
  const result = await db.query(sql, param);
  return result.rows;
};

const updatePfStatusTrue =
  (client) =>
  async ({ pfId }) => {
    const sql = `
    update pet_friend set is_order = true where user_id = $1
  `;
    const param = [pfId];
    const result = await client.query(sql, param);
    return result.rows;
  };

const finishOrder = async ({ orderId }) => {
  const sql = `
  update orders
  set is_finish_owner = true where order_id = $1
  `;
  const param = [orderId];
  const result = await db.query(sql, param);
  return result.rows;
};

const bookmarkPf = async ({ userId, pfId }) => {
  const sql = `
insert into bookmark (user_id, pf_id) values ($1, $2)
`;
  const param = [userId, pfId];
  const result = await db.query(sql, param);
  return result.rows;
};

const removeBookmark = async ({ userId, pfId }) => {
  const sql = `
  delete from bookmark
  where user_id = $1 and pf_id = $2`;
  const param = [userId, pfId];
  const result = await db.query(sql, param);
  return result.rows;
};

const getBookmarkPf = async ({ userId, searchKeyword }) => {
  let whereQuery =
    " AND " +
    searchToQuery({
      param: "$2",
      columns: ["username"],
    });
  const sql = `
WITH filtered_user AS (
    SELECT
        ul.user_id,
        ul.username,
        ul.pf_flag
    FROM user_list ul
    WHERE ul.user_id != $1
    ${whereQuery}
),
pf_user AS (
    SELECT 
        fu.user_id,
        fu.username,
        pf.price_hourly,
        pf.price_daily
    FROM filtered_user fu
    LEFT JOIN pet_friend pf ON pf.user_id = fu.user_id
    WHERE fu.pf_flag = true 
      AND pf.is_order = false 
      AND pf.is_active = true
),
bookmarked_pf AS (
    SELECT
        b.id,
        b.pf_id
    FROM bookmark b
    WHERE b.user_id = $1
)
SELECT 
    bpf.id,
    pu.*,
    ap.accept_dog,
    ap.accept_cat,
    ap.accept_other,
    ROUND(pfr.avg_rating, 1) AS avg_rating,
    pfr.review_count
FROM pf_user pu
JOIN bookmarked_pf bpf ON pu.user_id = bpf.pf_id
LEFT JOIN accepted_pet ap ON ap.user_id = pu.user_id
LEFT JOIN (
    SELECT
        pf_id,
        AVG(rating) AS avg_rating,
        COUNT(id) AS review_count
    FROM reviews
    GROUP BY pf_id
) pfr ON pu.user_id = pfr.pf_id
ORDER BY bpf.id;

`;
  const param = [userId, searchKeyword];
  const result = await db.query(sql, param);
  return result.rows;
};
module.exports = {
  retrieveUser,
  getPf,
  getPfById,
  getPfTaskService,
  getAllPfTaskService,
  createOrder,
  getOrderId,
  insertOrderPrice,
  retrieveOwnerAddress,
  retrievePfAddress,
  insertOrderAddresses,
  retrievePetbyPetId,
  insertOrderPet,
  insertOrderTasks,
  insertReview,
  getOwnerOrderList,
  getPfOrderList,
  getAllActiveOrder,
  updatePfStatus,
  updatePfStatusTrue,
  finishOrder,
  bookmarkPf,
  removeBookmark,
  getBookmarkPf,
};
