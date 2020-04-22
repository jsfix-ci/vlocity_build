var Attachment = module.exports = function(vlocity) {
    this.vlocity = vlocity;
};

Attachment.prototype.childrenExport = async function(inputMap) {
	try {
		var jobInfo = inputMap.jobInfo;
		var childrenDataPacks = inputMap.childrenDataPacks;

		var dataPackType = childrenDataPacks[0].VlocityDataPackType;

		let queryString = `Select Id from Attachment WHERE `;
		let whereClause = '';

		for (var dataPack of childrenDataPacks) {

			if (whereClause) {
				whereClause += ' OR ';
			}

			whereClause += `ParentId = '${dataPack.VlocityDataPackData.Id}'`;
		}

		let result = await this.vlocity.queryservice.query(queryString + whereClause);
		VlocityUtils.verbose('Children Query', queryString + whereClause, 'Results', result.records.length);
		for (var record of result.records) {
			let recordAdded = this.vlocity.datapacksjob.addRecordToExport(jobInfo, { VlocityDataPackType: dataPackType }, record);

			if (recordAdded) {
				VlocityUtils.verbose('Added from Children Query', dataPackType, record.Id);
			}
		}

		for (var dataPack of childrenDataPacks) {
			jobInfo.currentStatus[dataPack.VlocityDataPackKey] = 'Ignored';
			if (jobInfo.alreadyExportedKeys.indexOf(dataPack.VlocityDataPackKey) == -1) {
				jobInfo.alreadyExportedKeys.push(dataPack.VlocityDataPackKey);
			}
		}

		return true;
	} catch (e) {
		VlocityUtils.error('Children Export Error', e);
		return null;
	}
}